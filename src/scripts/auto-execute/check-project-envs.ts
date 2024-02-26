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
    // DISCORD CONFIG
    CLIENTID: Joi.string().required(),
    GUILDID: Joi.string().required(),
    OWNER: Joi.string().required(),
  });

  const validationResult = envSchema.validate(process.env, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (validationResult.error) {
    const errors = validationResult.error.details;
    const mappedErrors = errors.map(({ message }) => message).join("\n");

    logger.warn(`\n${mappedErrors}`, {
      icon: "😊",
      prefix: "Validation Error",
    });

    process.exit(1);
  }

  logger.log("Env schema vaildation passed successfuly");
})();
