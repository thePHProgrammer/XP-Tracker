import { describe, expect, it } from "vitest";
import { startOfDayInTimeZone, weekdayInTimeZone } from "./timezone";

describe("startOfDayInTimeZone", () => {
  it("returns UTC midnight for the UTC timezone", () => {
    const date = new Date("2026-08-08T15:30:00Z");
    const start = startOfDayInTimeZone(date, "UTC");
    expect(start.toISOString()).toBe("2026-08-08T00:00:00.000Z");
  });

  it("shifts to the correct UTC instant for a negative-offset timezone", () => {
    // 2026-08-08 02:00 in America/Los_Angeles (UTC-7 in August, DST) is
    // 2026-08-08 09:00Z. Midnight LA time that day is 2026-08-08T07:00:00Z.
    const date = new Date("2026-08-08T09:00:00Z");
    const start = startOfDayInTimeZone(date, "America/Los_Angeles");
    expect(start.toISOString()).toBe("2026-08-08T07:00:00.000Z");
  });

  it("shifts to the correct UTC instant for a positive-offset timezone", () => {
    // 2026-08-08 10:00 in Asia/Manila (UTC+8) is 2026-08-08T02:00:00Z.
    // Midnight Manila time that day is 2026-08-07T16:00:00Z.
    const date = new Date("2026-08-08T02:00:00Z");
    const start = startOfDayInTimeZone(date, "Asia/Manila");
    expect(start.toISOString()).toBe("2026-08-07T16:00:00.000Z");
  });

  it("is idempotent when applied to its own output", () => {
    const date = new Date("2026-08-08T15:30:00Z");
    const start = startOfDayInTimeZone(date, "America/Los_Angeles");
    const startAgain = startOfDayInTimeZone(start, "America/Los_Angeles");
    expect(startAgain.getTime()).toBe(start.getTime());
  });
});

describe("weekdayInTimeZone", () => {
  it("matches the UTC weekday when timezone is UTC", () => {
    // 2026-08-08 is a Saturday.
    const date = new Date("2026-08-08T12:00:00Z");
    expect(weekdayInTimeZone(date, "UTC")).toBe(6);
  });

  it("can roll the weekday back a day in a negative-offset timezone", () => {
    // 2026-08-08T02:00:00Z is still 2026-08-07 (Friday) in Los Angeles.
    const date = new Date("2026-08-08T02:00:00Z");
    expect(weekdayInTimeZone(date, "America/Los_Angeles")).toBe(5);
  });
});
