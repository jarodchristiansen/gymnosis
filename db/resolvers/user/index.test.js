/**
 * @jest-environment node
 */
import { UserResolver } from "./index";
import Gym from "../../models/gym";
import User from "../../models/user";

jest.mock("../../models/gym", () => ({ findById: jest.fn() }));

jest.mock("../../models/user", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  exists: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

const { queries, mutations, fields } = UserResolver;

const GYM = "b00000000000000000000001";
const ADMIN = { id: "a00000000000000000000001", role: "admin" };
const TRAINER = { id: "a00000000000000000000002", role: "trainer", gym: GYM };
const CLIENT = { id: "a00000000000000000000003", role: "client", gym: GYM };
const OTHER_CLIENT_ID = "a00000000000000000000004";
// A client in TRAINER's gym, assigned to TRAINER.
const theirClient = (extra = {}) => ({
  _id: OTHER_CLIENT_ID,
  role: "client",
  gym: GYM,
  trainer: TRAINER.id,
  ...extra,
});

const as = (viewer) => ({ viewer });
const codeOf = (promise) =>
  promise.then(
    () => "resolved",
    (err) => err.extensions?.code
  );
const lean = (value) => ({ lean: () => Promise.resolve(value) });

beforeEach(() => jest.resetAllMocks());

describe("getUsers", () => {
  const all = { filter: "ADMIN", value: "ALL" };
  const clients = { filter: "CLIENT_BY_ROLE", value: "ROLE_CLIENT" };

  it("needs a signed-in viewer", async () => {
    expect(await codeOf(queries.getUsers(null, all, as(null)))).toBe(
      "UNAUTHENTICATED"
    );
    expect(User.find).not.toHaveBeenCalled();
  });

  it("lists every real account for admins only", async () => {
    const sort = jest.fn().mockResolvedValue([]);
    User.find.mockReturnValue({ sort });
    expect(await codeOf(queries.getUsers(null, all, as(TRAINER)))).toBe(
      "FORBIDDEN"
    );
    expect(await codeOf(queries.getUsers(null, all, as(ADMIN)))).toBe(
      "resolved"
    );
    expect(User.find).toHaveBeenCalledWith({ expiresAt: { $exists: false } });
    expect(sort).toHaveBeenCalledWith({ createAt: -1 });
  });

  it("lists a trainer's own clients, and nothing for clients", async () => {
    User.find.mockResolvedValue([]);
    expect(await codeOf(queries.getUsers(null, clients, as(CLIENT)))).toBe(
      "FORBIDDEN"
    );
    await queries.getUsers(null, clients, as(TRAINER));
    expect(User.find).toHaveBeenCalledWith({
      role: "client",
      gym: GYM,
      trainer: TRAINER.id,
    });
  });

  it("lists nobody for a trainer without a gym", async () => {
    const result = await queries.getUsers(
      null,
      clients,
      as({ ...TRAINER, gym: null })
    );
    expect(result).toEqual([]);
    expect(User.find).not.toHaveBeenCalled();
  });

  it("rejects filters it doesn't know", async () => {
    expect(
      await codeOf(
        queries.getUsers(null, { filter: "?", value: "?" }, as(TRAINER))
      )
    ).toBe("BAD_USER_INPUT");
  });
});

describe("getUser", () => {
  it("lets clients read themselves, and nobody else", async () => {
    User.findOne.mockReturnValueOnce(lean({ _id: CLIENT.id, role: "client" }));
    const me = await queries.getUser(null, { id: CLIENT.id }, as(CLIENT));
    expect(me.id).toBe(CLIENT.id);

    User.findOne.mockReturnValueOnce(lean(theirClient()));
    expect(
      await codeOf(queries.getUser(null, { id: OTHER_CLIENT_ID }, as(CLIENT)))
    ).toBe("NOT_FOUND");
  });

  it("lets trainers read their clients, but not others or admins", async () => {
    User.findOne.mockReturnValueOnce(lean(theirClient()));
    await expect(
      queries.getUser(null, { id: OTHER_CLIENT_ID }, as(TRAINER))
    ).resolves.toMatchObject({ id: OTHER_CLIENT_ID });

    User.findOne.mockReturnValueOnce(
      lean(theirClient({ trainer: "a00000000000000000000009" }))
    );
    expect(
      await codeOf(queries.getUser(null, { id: OTHER_CLIENT_ID }, as(TRAINER)))
    ).toBe("NOT_FOUND");

    User.findOne.mockReturnValueOnce(lean({ _id: ADMIN.id, role: "admin" }));
    expect(
      await codeOf(queries.getUser(null, { id: ADMIN.id }, as(TRAINER)))
    ).toBe("NOT_FOUND");
  });

  it("looks profiles up by username", async () => {
    User.findOne.mockReturnValueOnce(lean({ _id: CLIENT.id, role: "client" }));
    await queries.getUser(null, { username: "sam" }, as(CLIENT));
    expect(User.findOne).toHaveBeenCalledWith({ username: "sam" });
  });

  it("treats a malformed id as not found, without querying", async () => {
    expect(await codeOf(queries.getUser(null, { id: "nope" }, as(ADMIN)))).toBe(
      "NOT_FOUND"
    );
    expect(User.findOne).not.toHaveBeenCalled();
  });
});

describe("updateUsername", () => {
  it("only ever renames the viewer", async () => {
    User.exists.mockResolvedValue(null);
    User.findOneAndUpdate.mockResolvedValue({});
    await mutations.updateUsername(
      null,
      { input: { username: "new_name", email: "someone@else.com" } },
      as(CLIENT)
    );
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: CLIENT.id },
      { username: "new_name" },
      { new: true }
    );
  });

  it("refuses taken and malformed names", async () => {
    User.exists.mockResolvedValue({ _id: OTHER_CLIENT_ID });
    expect(
      await codeOf(
        mutations.updateUsername(
          null,
          { input: { username: "taken" } },
          as(CLIENT)
        )
      )
    ).toBe("BAD_USER_INPUT");
    expect(
      await codeOf(
        mutations.updateUsername(
          null,
          { input: { username: "a b" } },
          as(CLIENT)
        )
      )
    ).toBe("BAD_USER_INPUT");
    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe("User.trainer", () => {
  const sam = { _id: TRAINER.id, name: "Sam Rivera", image: null };
  const findsTrainer = () =>
    User.findById.mockReturnValue({
      select: () => ({ lean: () => Promise.resolve(sam) }),
    });

  it("names a client's trainer for staff", async () => {
    findsTrainer();
    expect(await fields.trainer(theirClient(), null, as(TRAINER))).toEqual({
      id: TRAINER.id,
      name: "Sam Rivera",
      image: null,
    });
  });

  it("is null for clients, and for clients without a trainer", async () => {
    findsTrainer();
    expect(await fields.trainer(theirClient(), null, as(CLIENT))).toBeNull();
    expect(
      await fields.trainer(theirClient({ trainer: null }), null, as(ADMIN))
    ).toBeNull();
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("looks each trainer up once per request", async () => {
    findsTrainer();
    const context = as(ADMIN);
    await Promise.all([
      fields.trainer(theirClient(), null, context),
      fields.trainer(
        theirClient({ _id: "a00000000000000000000009" }),
        null,
        context
      ),
    ]);
    expect(User.findById).toHaveBeenCalledTimes(1);
  });
});

describe("addClient", () => {
  const OWNER = { id: "a00000000000000000000005", role: "owner", gym: GYM };
  const realGym = { _id: GYM, name: "Gymnosis", isDemo: false };
  const add = (viewer, input) =>
    mutations.addClient(null, { input }, as(viewer));

  beforeEach(() => {
    Gym.findById.mockReturnValue(lean(realGym));
    User.create.mockImplementation((doc) => Promise.resolve(doc));
  });

  it("adds a trainer's client to their gym, under them", async () => {
    User.findOne.mockReturnValue(lean(null));

    await add(TRAINER, { name: " Dana Ruiz ", email: " Dana@Example.com " });

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Dana Ruiz",
        email: "dana@example.com",
        role: "client",
        gym: GYM,
        trainer: TRAINER.id,
        username: expect.stringMatching(/^user-[0-9a-f]{8}$/),
      })
    );
  });

  it("makes owners choose a trainer from their own gym", async () => {
    expect(
      await codeOf(add(OWNER, { name: "Dana", email: "dana@example.com" }))
    ).toBe("BAD_USER_INPUT");

    User.findOne.mockReturnValue(
      lean({
        _id: "a00000000000000000000006",
        role: "trainer",
        gym: "b00000000000000000000002",
      })
    );
    expect(
      await codeOf(
        add(OWNER, {
          name: "Dana",
          email: "dana@example.com",
          trainerId: "a00000000000000000000006",
        })
      )
    ).toBe("BAD_USER_INPUT");
    expect(User.create).not.toHaveBeenCalled();
  });

  it("never takes a real address in a demo gym", async () => {
    const expiresAt = new Date("2026-11-22T00:00:00Z");
    Gym.findById.mockReturnValue(lean({ _id: GYM, isDemo: true, expiresAt }));

    await add(TRAINER, { name: "Dana", email: "someone@gmail.com" });

    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: expect.stringMatching(/@demo\.invalid$/),
        expiresAt,
      })
    );
  });

  it("brings in someone who signed up on their own", async () => {
    User.findOne.mockReturnValue(
      lean({ _id: OTHER_CLIENT_ID, role: "client", email: "dana@example.com" })
    );
    User.findOneAndUpdate.mockResolvedValue({ _id: OTHER_CLIENT_ID });

    await add(TRAINER, { name: "Dana", email: "dana@example.com" });

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: OTHER_CLIENT_ID, gym: null },
      { $set: { gym: GYM, trainer: TRAINER.id } },
      { new: true }
    );
    expect(User.create).not.toHaveBeenCalled();
  });

  it("refuses an address that's already in a gym, and clients can't add anyone", async () => {
    User.findOne.mockReturnValue(
      lean(theirClient({ email: "dana@example.com" }))
    );
    expect(
      await codeOf(add(TRAINER, { name: "Dana", email: "dana@example.com" }))
    ).toBe("BAD_USER_INPUT");
    expect(
      await codeOf(add(CLIENT, { name: "Dana", email: "dana@example.com" }))
    ).toBe("FORBIDDEN");
    expect(User.create).not.toHaveBeenCalled();
  });
});

describe("assignTrainer", () => {
  const OWNER = { id: "a00000000000000000000005", role: "owner", gym: GYM };
  const JORDAN = "a00000000000000000000007";
  const assign = (viewer, trainerId = JORDAN) =>
    mutations.assignTrainer(
      null,
      { clientId: OTHER_CLIENT_ID, trainerId },
      as(viewer)
    );

  it("lets an owner move a client to another trainer in the gym", async () => {
    User.findOne
      .mockReturnValueOnce(lean(theirClient()))
      .mockReturnValueOnce(lean({ _id: JORDAN, role: "trainer", gym: GYM }));
    User.findOneAndUpdate.mockResolvedValue({});

    expect(await codeOf(assign(OWNER))).toBe("resolved");
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: OTHER_CLIENT_ID },
      { $set: { trainer: JORDAN } },
      { new: true }
    );
  });

  it("is for owners and admins only, within the client's gym", async () => {
    expect(await codeOf(assign(TRAINER))).toBe("FORBIDDEN");

    User.findOne.mockReturnValueOnce(
      lean(theirClient({ gym: "b00000000000000000000002" }))
    );
    expect(await codeOf(assign(OWNER))).toBe("NOT_FOUND");

    User.findOne
      .mockReturnValueOnce(lean(theirClient()))
      .mockReturnValueOnce(
        lean({ _id: JORDAN, role: "trainer", gym: "b00000000000000000000002" })
      );
    expect(await codeOf(assign(OWNER))).toBe("BAD_USER_INPUT");
    expect(User.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe("trainers", () => {
  const chain = (people) => ({
    select: () => ({ sort: () => ({ lean: () => Promise.resolve(people) }) }),
  });

  it("lists an owner's own gym, and only real gyms for admins", async () => {
    User.find.mockReturnValue(chain([{ _id: TRAINER.id, name: "Sam Rivera" }]));

    const OWNER = { id: "a00000000000000000000005", role: "owner", gym: GYM };
    expect(await queries.trainers(null, {}, as(OWNER))).toEqual([
      { id: TRAINER.id, name: "Sam Rivera", image: undefined },
    ]);
    expect(User.find).toHaveBeenLastCalledWith({
      role: { $in: ["trainer", "owner"] },
      gym: GYM,
    });

    await queries.trainers(null, {}, as(ADMIN));
    expect(User.find).toHaveBeenLastCalledWith({
      role: { $in: ["trainer", "owner"] },
      expiresAt: { $exists: false },
    });
  });
});
