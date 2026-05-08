import { describe, it, expect, vi } from "vitest";

vi.mock("~/server/db", () => ({ db: {} }));

const { postRouter } = await import("./post");
const { createCallerFactory } = await import("~/server/api/trpc");

const createCaller = createCallerFactory(postRouter);

describe("post router", () => {
  it("hello returns a greeting", async () => {
    const caller = createCaller({
      db: {} as never,
      headers: new Headers(),
    });

    const result = await caller.hello({ text: "world" });

    expect(result).toEqual({ greeting: "Hello world" });
  });
});
