import { logger } from "@app/core/logger/logger-client";
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
    CLIENTID: Joi.string().required(),
    OWNER: Joi.string().required(),
  }).unknown();

  try {
    await envSchema.validateAsync(process.env);

    logger.log("Env schema vaildation passed successfuly");
  } catch (err) {
    logger.log(`${err}`);

    process.exit();
  }
})();
