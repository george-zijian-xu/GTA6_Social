import { describe, it, expect, vi } from "vitest";
import { searchLocations, calculateLocationHotScore } from "./locations";

describe("searchLocations", () => {
  it("returns matching locations for partial name", async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [
                  {
                    id: "1",
                    name: "Vice Beach",
                    slug: "vice-beach",
                    category: "beach",
                    ig_x: 100,
                    ig_y: 200,
                    rl_lat: 25.76,
                    rl_lng: -80.19,
                    description: "A beach",
                    post_count: 10,
                  },
                ],
                error: null,
              })),
            })),
          })),
        })),
      })),
    } as any;

    const result = await searchLocations("beach", mockClient);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Vice Beach");
  });

  it("returns empty array when no matches", async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ data: [], error: null })),
            })),
          })),
        })),
      })),
    } as any;

    const result = await searchLocations("nonexistent", mockClient);
    expect(result).toEqual([]);
  });
});

describe("calculateLocationHotScore", () => {
  it("calculates correct score using Reddit formula", async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                data: [{ like_count: 10, comment_count: 5, created_at: oneHourAgo }],
                error: null,
              })),
            })),
          })),
        })),
      })),
    } as any;

    const result = await calculateLocationHotScore("loc-1", mockClient);
    const expectedUps = 10 + 5 * 2; // 20
    const expectedScore = expectedUps / Math.pow(1 + 2, 1.5); // 20 / 5.196
    expect(result).toBeCloseTo(expectedScore, 1);
  });

  it("returns 0 for locations with no posts", async () => {
    const mockClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({ data: [], error: null })),
            })),
          })),
        })),
      })),
    } as any;

    const result = await calculateLocationHotScore("loc-empty", mockClient);
    expect(result).toBe(0);
  });
});

