import { FILTER_CONSTS, SEARCH_VALUE_CONSTS } from "@/helpers/Consts";
import User from "../../models/user";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export const UserResolver = {
  queries: {
    getUsers: async (_, { filter, value }) => {
      if (filter === FILTER_CONSTS.ADMIN && value === SEARCH_VALUE_CONSTS.ALL) {
        let users = await User.find({}).catch((err) => new Error(err));

        return users;
      } else if (
        filter === FILTER_CONSTS.CLIENT_BY_ROLE &&
        value === SEARCH_VALUE_CONSTS.ROLE_CLIENT
      ) {
        let users = await User.find({ role: "client" }).catch(
          (err) => new Error(err)
        );

        return users;
      } else if (filter === FILTER_CONSTS.CLIENT_BY_ID && value) {
        let users = await User.find({ id: value }).catch(
          (err) => new Error(err)
        );

        return users;
      }
    },

    createWorkout: async (_, { prompt }) => {
      console.log({ prompt }, "IN REDUCER");

      const url = "https://api.openai.com/v1/chat/completions";

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      };

      const requestData = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert personal trainer with years of experience working with JavaScript as well. You output responses solely as a JavaScript Object when queried for workout routines matching the example in the prompt structure precisely.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      };

      const data = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      }).then((response) => response.json());

      const { choices } = data;

      let message;
      let content;

      if (choices.length) {
        message = choices[0].message;
        content = choices[0].message.content;
      }

      content = JSON.parse(content);

      console.log({ data, choices, message, content });

      if (content[Object.keys(content)[0]]) {
        content[Object.keys(content)[0]] = content[Object.keys(content)[0]].map(
          (day) => {
            if (day.exercises) {
              day.exercises = day.exercises.map((exercise) => {
                exercise.sets = parseInt(exercise.sets);
                exercise.reps = parseInt(exercise.reps);
                return exercise;
              });
            }

            return day;
          }
        );

        console.log(content[Object.keys(content)[0]], "ROUTINE");

        return content[Object.keys(content)[0]];
      }
    },

    getAssetPriceData: async (_, { tickers, exchange_data }) => {
      if (tickers) {
        try {
          const { public_key: publicKey, private_key: privateKey } =
            exchange_data;

          const ccxt = require("ccxt");

          const exchange = new ccxt.coinbase({
            apiKey: publicKey,
            secret: privateKey,
          });

          let prices = await exchange.fetchTickers(tickers);
          let assetArray = [];

          if (prices) {
            for (let i in prices) {
              assetArray.push({ symbol: i, info: 1 / prices[i].info });
            }
          }

          return assetArray;
        } catch (err) {}
      }
    },
    getUserExchangeData: async (_, { input }) => {
      const {
        exchangeData,
        public_key: publicKey,
        private_key: privateKey,
      } = input;

      const ccxt = require("ccxt");

      try {
        const exchange = new ccxt.coinbase({
          apiKey: publicKey,
          secret: privateKey,
        });

        let balance = {};
        let tickers = [];

        let list = await exchange.fetchBalance();

        balance = Object.entries(list.free)
          .filter((entry) => entry[1] > 0)
          .map((entry) => {
            tickers.push(`${entry[0]}/USD`);

            return {
              symbol: entry[0],
              balance: entry[1],
              ticker: `${entry[0]}/USD`,
            };
          });

        let prices = await exchange.fetchTickers(tickers);
        let assetArray = [];

        if (prices) {
          for (let i in prices) {
            assetArray.push({
              symbol: prices[i].symbol,
              usd: 1 / prices[i].info,
            });
          }
        }

        const result = balance.map((asset) => ({
          ...asset,
          ...assetArray.find((price) => price.symbol === asset.ticker),
        }));

        return { balances: result };
      } catch (err) {
        throw new Error(err);
      }
    },

    getUser: async (_, { email, id }) => {
      // Searches for user profile based on id for profile page, needs update
      let user;

      if (id) {
        user = await User.find({ username: id })
          .then((res) => res[0].toObject())
          .catch((err) => new Error(err));
      } else if (email) {
        user = User.find({ email })
          .then((res) => res[0].toObject())
          .catch((err) => new Error(err));
      }

      if (user?.favorites) {
        for (let i of user.favorites) {
          i.id = user.favorites.indexOf(i);
        }
      }

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    },
  },
  mutations: {
    removeFavorite: async (_, { input }) => {
      const { asset, email } = input;

      try {
        let user = await User.findOne({ email });

        if (user) {
          if (
            user.favorites.find(
              (item) =>
                item?.symbol?.toLowerCase() === asset.symbol.toLowerCase()
            )
          ) {
            user.favorites = user.favorites.filter(function (item) {
              return item?.symbol?.toLowerCase() !== asset.symbol.toLowerCase();
            });

            user.save();

            return user;
          }
        }
        return "user not found";
      } catch (err) {
        throw new Error("Error in removeFavorite!!", err);
      }
    },

    addFavorite: async (_, { input }) => {
      const { asset, email } = input;

      try {
        let user = await User.findOne({ email });

        if (user) {
          if (
            user.favorites.find(
              (item) =>
                item?.symbol?.toLowerCase() === asset.symbol.toLowerCase()
            )
          ) {
            return;
          }
          user.favorites.push(asset);

          user.save();
        }

        return user;
      } catch (err) {
        throw new Error("Error in addFavorite!!", err);
      }
    },
    updateUsername: async (_, { input }) => {
      const { username, email } = input;

      try {
        let user = await User.findOne({ email });

        let inputMatch = await User.findOne({ username: username });

        inputMatch && new Error("User name already exists");

        if (user && !inputMatch) {
          user.username = username;
          await user.save();
          return user;
        }
      } catch (err) {
        throw new Error("Error in updating username!", err);
      }
    },
  },
};
