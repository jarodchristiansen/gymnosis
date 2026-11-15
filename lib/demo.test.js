/**
 * @jest-environment node
 */
import { DEMO_LIMITS, clientIp, createDemoSandbox } from "./demo";
import Gym from "../db/models/gym";
import Plan from "../db/models/plan";
import User from "../db/models/user";
import { takeRateLimit } from "./rateLimit";

jest.mock("../db/models/gym", () => ({ create: jest.fn() }));
jest.mock("../db/models/plan", () => ({ insertMany: jest.fn() }));
jest.mock("../db/models/user", () => ({ insertMany: jest.fn() }));
jest.mock("./rateLimit", () => ({ takeRateLimit: jest.fn() }));

beforeEach(() => jest.resetAllMocks());

describe("createDemoSandbox", () => {
  it("seeds a gym and signs the visitor in as the role they picked", async () => {
    const login = await createDemoSandbox("trainer", "203.0.113.9");

    expect(login).toMatchObject({
      name: "Sam Rivera",
      role: "trainer",
      demo: true,
    });
    expect(Gym.create).toHaveBeenCalledWith(
      expect.objectContaining({ isDemo: true })
    );
    expect(User.insertMany.mock.calls[0][0]).toHaveLength(9);
    expect(Plan.insertMany.mock.calls[0][0]).toHaveLength(5);
  });

  it("counts against the visitor's and the overall hourly limits first", async () => {
    await createDemoSandbox("client", "203.0.113.9");
    expect(takeRateLimit).toHaveBeenCalledWith("demo-ip:203.0.113.9", {
      limit: DEMO_LIMITS.perIpPerHour,
      windowMs: 3600000,
    });
    expect(takeRateLimit).toHaveBeenCalledWith("demo-all", {
      limit: DEMO_LIMITS.allPerHour,
      windowMs: 3600000,
    });
  });

  it("creates nothing once a limit is hit", async () => {
    takeRateLimit.mockRejectedValueOnce(new Error("limited"));
    await expect(createDemoSandbox("owner", "x")).rejects.toThrow("limited");
    expect(Gym.create).not.toHaveBeenCalled();
  });

  it("refuses roles it doesn't offer", async () => {
    await expect(createDemoSandbox("admin", "x")).rejects.toThrow();
    expect(takeRateLimit).not.toHaveBeenCalled();
  });
});

describe("clientIp", () => {
  it("takes the first forwarded address", () => {
    expect(
      clientIp({ headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } })
    ).toBe("203.0.113.9");
  });

  it("falls back to the socket", () => {
    expect(
      clientIp({ headers: {}, socket: { remoteAddress: "127.0.0.1" } })
    ).toBe("127.0.0.1");
  });
});
