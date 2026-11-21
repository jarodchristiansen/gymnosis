jest.mock("mongoose", () => ({
  connection: { readyState: 0 },
  connect: jest.fn(),
}));

describe("connectDb", () => {
  let connectDb;
  let mongoose;

  beforeEach(() => {
    // A fresh module per test, so no connection carries over between them.
    jest.resetModules();
    mongoose = require("mongoose");
    jest.spyOn(console, "error").mockImplementation(() => {});
    connectDb = require("./index");
  });

  it("opens one connection however many requests ask at once", async () => {
    mongoose.connect.mockResolvedValue(mongoose);

    await Promise.all([connectDb(), connectDb(), connectDb()]);

    expect(mongoose.connect).toHaveBeenCalledTimes(1);
  });

  it("doesn't reconnect once connected", async () => {
    mongoose.connection.readyState = 1;

    await connectDb();

    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it("fails loudly, then lets the next request try again", async () => {
    mongoose.connect
      .mockRejectedValueOnce(new Error("server selection timed out"))
      .mockResolvedValueOnce(mongoose);

    await expect(connectDb()).rejects.toThrow("server selection timed out");
    await expect(connectDb()).resolves.toBe(mongoose);
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });
});
