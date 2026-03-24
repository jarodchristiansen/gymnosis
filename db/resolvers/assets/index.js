const CoinGecko = require("coingecko-api");
import Asset from "../../models/asset";
import btc_macros from "../../models/btc_macro";

async function fetchHistodayPriceSeries(symbol, time) {
  const priceData = await fetch(
    `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol.toUpperCase()}&tsym=USD&limit=${time}`
  ).then((response) => response.json());
  return priceData.Data?.Data;
}

async function fetchBlockchainSeriesIfMajor(symbol, time) {
  const upper = symbol.toUpperCase();
  if (upper !== "BTC" && upper !== "ETH") {
    return undefined;
  }
  const blockchainData = await fetch(
    `https://min-api.cryptocompare.com/data/blockchain/histo/day?fsym=${symbol}&limit=${time}&api_key=${process.env.CRYPTO_COMPARE_KEY}`
  ).then((response) => response.json());
  return blockchainData.Data?.Data;
}

async function loadPriceAndBlockchainHistory(symbol, time) {
  const data = {
    priceData: await fetchHistodayPriceSeries(symbol, time),
  };
  const blockchainData = await fetchBlockchainSeriesIfMajor(symbol, time);
  if (blockchainData) {
    data.blockchainData = blockchainData;
  }
  if (!data.priceData) {
    throw new Error("Asset not found");
  }
  return data;
}

async function findDbAssetByNameOrSymbol(name) {
  let dbAsset = await Asset.findOne({ name });
  if (!dbAsset) {
    dbAsset = await Asset.findOne({ symbol: name });
  }
  return dbAsset;
}

export const AssetResolver = {
  getAssets: async (_, { offset, limit }) => {
    try {
      const assets = await Asset.find({})
        .limit(offset * limit)
        .sort("-market_cap");

      return assets;
    } catch (err) {
      throw new Error(err, "In getAssets resolver");
    }
  },

  getAsset: async (_, { symbol, type }) => {
    try {
      if (!type || type === "Crypto") {
        const CoinGeckoClient = new CoinGecko();

        const assets = await CoinGeckoClient.coins.list();

        return assets?.data?.filter((e) =>
          e.symbol.toLowerCase().includes(symbol.toLowerCase())
        );
      }
      if (type === "TradFI") {
        const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${process.env.ALPHA_VANTAGE}`;

        const data = await fetch(url).then((response) => response.json());

        const { bestMatches } = data;

        const formattedData = bestMatches?.map((match) => {
          return {
            id: match["1. symbol"],
            symbol: match["1. symbol"],
            name: match["2. name"],
          };
        });

        return formattedData;
      }
    } catch (err) {
      throw new Error(err);
    }
  },

  getDifficultyRibbons: async (_, { symbol, cut }) => {
    const data = await fetch(
      `https://api.glassnode.com/v1/metrics/indicators/difficulty_ribbon?a=${symbol}&api_key=${process.env.GLASSNODE_KEY}`
    ).then((response) => response.json());

    const ribbonData = [];

    for (const i of data.slice(-cut)) {
      ribbonData.push({
        t: i.t,
        ma9: i.o.ma9,
        ma14: i.o.ma14,
        ma25: i.o.ma25,
        ma40: i.o.ma40,
        ma60: i.o.ma60,
        ma90: i.o.ma90,
        ma128: i.o.ma128,
        ma200: i.o.ma200,
      });
    }

    return ribbonData;
  },

  getBTCMacros: async () => {
    const data = {};

    const results = await btc_macros.find({});

    const responses = [];

    for (const i of results) {
      if (typeof i.rolling_sharpe !== "number")
        i.rolling_sharpe = parseFloat(0);

      if (typeof i.returns !== "number") i.returns = parseFloat(1.1);

      if (typeof i.norm_returns !== "number") i.norm_returns = parseFloat(1.1);

      responses.push({
        time: i.time,
        high: i.high,
        low: i.low,
        open: i.open,
        volumefrom: i.volumefrom,
        volumeto: i.volumeto,
        close: i.close,
        totalvolume: i.totalvolume,
        VWAP: i.VWAP,
        TWAP: i.TWAP,
        norm_returns: i.norm_returns,
        returns: i.returns,
        rolling_sharpe: i.rolling_sharpe,
      });
    }

    data.macro_data = responses;

    return data;
  },

  getAssetSocialData: async (_, { symbol }) => {
    try {
      const response = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist"
      ).then((response) => response.json());

      const coins = response.Data;

      const coin = Object.values(coins).find(
        (c) => c.Symbol.toUpperCase() === symbol.toUpperCase()
      );

      if (!coin) {
        throw new Error("Coin not found");
      }

      const coinId = coin.Id;
      if (!coinId) {
        return null;
      }

      const socialData = await fetch(
        `https://min-api.cryptocompare.com/data/social/coin/histo/day?coinId=${coinId}&api_key=${process.env.CRYPTO_COMPARE_KEY}`
      ).then((response) => response.json());

      return socialData.Data;
    } catch (error) {
      console.error("Error retrieving coinId:", error);
      throw error;
    }
  },

  getAssetNews: async (_, { symbol }) => {
    const data = {};
    const newsData = await fetch(
      `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${symbol.toUpperCase()}`
    ).then((response) => response.json());

    data.newsData = newsData.Data;

    return data.newsData;
  },

  getAssetPairs: async (_, { symbol }) => {
    const data = {};

    const pairData = await fetch(
      `https://min-api.cryptocompare.com/data/top/volumes?tsym=${symbol.toUpperCase()}`
    ).then((response) => response.json());

    data.pairData = pairData.Data;

    return data.pairData;
  },

  getAssetFinancialDetails: async (_, { symbol, time }) => {
    try {
      return await loadPriceAndBlockchainHistory(symbol, time);
    } catch (err) {
      throw new Error(err);
    }
  },

  getAssetHistory: async (_, { symbol, time }) => {
    try {
      return await loadPriceAndBlockchainHistory(symbol, time);
    } catch (err) {
      throw new Error(err);
    }
  },

  getGeckoAssetDetails: async (_, { name }) => {
    try {
      const CoinGeckoClient = new CoinGecko();

      const coinList = await CoinGeckoClient.coins.list();

      const geckoProp = coinList?.data?.filter(
        (asset) => name.toLowerCase() === asset.name.toLowerCase()
      );

      const dbAsset = await findDbAssetByNameOrSymbol(name);

      let data = {};

      if (geckoProp?.length) {
        const geckoData = await CoinGeckoClient.coins.fetch(geckoProp[0].id, {
          market_data: false,
          localization: false,
        });

        data = geckoData?.data ?? {};
      }

      if (dbAsset?.favorite_count != null) {
        data.favorite_count = dbAsset.favorite_count;
      }

      if (Object.keys(data).length > 0) {
        return data;
      }
      throw new Error("Asset not found");
    } catch (err) {
      throw new Error(err);
    }
  },
};
