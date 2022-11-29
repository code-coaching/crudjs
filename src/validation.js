const { z } = require("zod");

const exampleSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const sampleSchema = z.object({
  example: z.array(exampleSchema),
});

const COLLECTIONS = {
  EXAMPLE: "example",
  SAMPLE: "sample",
};

const VALIDATIONS = {
  [COLLECTIONS.EXAMPLE]: exampleSchema,
  [COLLECTIONS.SAMPLE]: sampleSchema,
};

module.exports = {
  VALIDATIONS,
};
