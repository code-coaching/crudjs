const { ObjectId } = require('mongodb');
const { weeks } = require("./utils/duration");
const { z } = require("zod");

const exampleSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const sampleSchema = z.object({
  example: z.array(exampleSchema),
});

/* Do not remove if you want GitHub authentication */
const userSchema = z.object({
  _id: z.optional(z.instanceof(ObjectId)),
  github: z.optional(
    z.object({
      id: z.string(),
      username: z.string(),
    })
  ),
});

const END_POINTS = {
  "example-end-point": exampleSchema,
  sample: sampleSchema,

  /* Do not remove if you want GitHub authentication */
  users: userSchema,
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
