/**
 * @jest-environment node
 */
import { UserResolver } from "./index";
import User from "../../models/user";

jest.mock("../../models/user", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  exists: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

const { queries, mutations } = UserResolver;

const ADMIN = { id: "a00000000000000000000001", role: "admin" };
const TRAINER = { id: "a00000000000000000000002", role: "trainer" };
const CLIENT = { id: "a00000000000000000000003", role: "client" };
const OTHER_CLIENT_ID = "a00000000000000000000004";

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

  it("lists everyone for admins only", async () => {
    User.find.mockResolvedValue([]);
    expect(await codeOf(queries.getUsers(null, all, as(TRAINER)))).toBe(
      "FORBIDDEN"
    );
    expect(await codeOf(queries.getUsers(null, all, as(ADMIN)))).toBe(
      "resolved"
    );
    expect(User.find).toHaveBeenCalledWith({});
  });

  it("lists clients for trainers, but not for clients", async () => {
    User.find.mockResolvedValue([]);
    expect(await codeOf(queries.getUsers(null, clients, as(CLIENT)))).toBe(
      "FORBIDDEN"
    );
    await queries.getUsers(null, clients, as(TRAINER));
    expect(User.find).toHaveBeenCalledWith({ role: "client" });
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

    User.findOne.mockReturnValueOnce(
      lean({ _id: OTHER_CLIENT_ID, role: "client" })
    );
    expect(
      await codeOf(queries.getUser(null, { id: OTHER_CLIENT_ID }, as(CLIENT)))
    ).toBe("NOT_FOUND");
  });

  it("lets trainers read clients but not admins", async () => {
    User.findOne.mockReturnValueOnce(
      lean({ _id: OTHER_CLIENT_ID, role: "client" })
    );
    await expect(
      queries.getUser(null, { id: OTHER_CLIENT_ID }, as(TRAINER))
    ).resolves.toMatchObject({ id: OTHER_CLIENT_ID });

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

describe("addWorkoutRoutine", () => {
  const input = {
    id: OTHER_CLIENT_ID,
    routine: [{ day: 1, bodyPart: "Legs", exercises: [] }],
  };
  const clientDoc = () => ({
    _id: OTHER_CLIENT_ID,
    role: "client",
    workoutHistory: [],
    save: jest.fn(),
  });

  it("is for trainers and admins", async () => {
    expect(
      await codeOf(mutations.addWorkoutRoutine(null, { input }, as(CLIENT)))
    ).toBe("FORBIDDEN");
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("saves a trainer's plan onto a client", async () => {
    const doc = clientDoc();
    User.findOne.mockResolvedValue(doc);
    await mutations.addWorkoutRoutine(null, { input }, as(TRAINER));
    expect(doc.workoutHistory).toHaveLength(1);
    expect(doc.save).toHaveBeenCalled();
  });

  it("won't write to another trainer", async () => {
    User.findOne.mockResolvedValue({ ...clientDoc(), role: "trainer" });
    expect(
      await codeOf(mutations.addWorkoutRoutine(null, { input }, as(TRAINER)))
    ).toBe("NOT_FOUND");
  });

  it("needs at least one day", async () => {
    expect(
      await codeOf(
        mutations.addWorkoutRoutine(
          null,
          { input: { ...input, routine: [] } },
          as(TRAINER)
        )
      )
    ).toBe("BAD_USER_INPUT");
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

describe("createWorkout", () => {
  it("is closed to signed-out callers and clients", async () => {
    global.fetch = jest.fn();
    expect(
      await codeOf(queries.createWorkout(null, { prompt: "x" }, as(null)))
    ).toBe("UNAUTHENTICATED");
    expect(
      await codeOf(queries.createWorkout(null, { prompt: "x" }, as(CLIENT)))
    ).toBe("FORBIDDEN");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
