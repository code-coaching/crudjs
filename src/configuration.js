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

module.exports = {
  END_POINTS,
};
