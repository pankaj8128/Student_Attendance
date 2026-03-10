const Joi = require("joi");

const add = Joi.object({
  first_name: Joi.string().required().messages({
    "string.empty": "First name cannot be empty",
    "any.required": "Username is required",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Last name cannot be empty",
    "any.required": "Password is required",
  }),
});

const update = Joi.object({
  id: Joi.number().integer().required().min(1).required().messages({
    "number.base": "ID must be a number",
    "number.integer": "ID must be an integer",
    "number.min": "ID must be positive",
    "any.required": "ID is required",
  }),
  first_name: Joi.string().required().messages({
    "string.empty": "First name cannot be empty",
    "any.required": "Username is required",
  }),
  last_name: Joi.string().required().messages({
    "string.empty": "Last name cannot be empty",
    "any.required": "Password is required",
  }),
});

module.exports = { add, update };
