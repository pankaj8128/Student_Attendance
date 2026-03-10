const Joi = require("joi");

const login = Joi.object({
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
});

module.exports = login;
