import "dotenv/config";
import Joi from "joi";

(async () => {
  const envSchema = Joi.object({
    // CORE CONFIG
    TOKEN: Joi.string().required(),
    // DATABASE CONFIG
    DATABASE_PORT: Joi.number().required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_HOST: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
  }).unknown();

  try {
    await envSchema.validateAsync(process.env);

    console.log("✅ ENV SCHEMA VALIDATION SUCCESSFULLY PASSED!");
  } catch (err) {
    console.log(err);

    throw new Error("⚠️ ENV SCHEMA VALIDATION FAILED!");
  }
})();
