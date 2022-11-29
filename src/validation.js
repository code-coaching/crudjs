const Joi = require("@hapi/joi");

const exampleSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
});

const sampleSchema = Joi.object({
  example: Joi.array().items(exampleSchema),
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
