const Joi = require("joi");

const signup = Joi.object({
  username: Joi.string().alphanum().min(5).max(15).required().messages({
    "string.min": "Username must have minimum 5 characters",
    "string.max": "Username must have maximum 15 characters",
    "string.empty": "Username cannot be empty",
    "any.required": "Username is required",
  }),
  password: Joi.string().alphanum().min(5).max(15).required().messages({
    "string.min": "Password must have minimum 5 characters",
    "string.max": "Password must have maximum 15 characters",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
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

module.exports = signup;
