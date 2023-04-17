const { hours, days, weeks } = require("./utils/duration");
const { z } = require("zod");

const exampleSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const sampleSchema = z.object({
  example: z.array(exampleSchema),
});

const END_POINTS = {
  "example-end-point": exampleSchema,
  sample: sampleSchema,
};

const PROXY_CACHE = {
  pokeapi: {
    endpoint: "https://pokeapi.co/api/v2",
    swapEndpoint: true,
    /**
     * Cache duration in milliseconds
     * milliseconds * seconds * minutes * hours * day
     * uncomment the one you want to use
     */
    cacheDuration: weeks(1), // 1 week
    // cacheDuration: weeks(1) + days(3) + hours(5), //  1 week, 3 days, 5 hours
    // cacheDuration: days(1), // 1 day
    // cacheDuration: hours(1), // 1 hour
    // cacheDuration: minutes(1), // 1 minute
  },
};

module.exports = {
  END_POINTS,
  PROXY_CACHE,
};
