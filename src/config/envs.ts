import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    STRIPE_SECRET_KEY: string;
    STRIPE_ENDPOINT_SECRET: string;
    STRIPE_SUCCESS_URL: string;
    STRIPE_CANCEL_URL: string;
}

const envVarsSchema = joi.object({
    PORT: joi.number().required().default(3000),
    STRIPE_SECRET_KEY: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
    STRIPE_SUCCESS_URL: joi.string().required(),
    STRIPE_CANCEL_URL: joi.string().required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate(process.env, {
    abortEarly: false,
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const envVars : EnvVars = value

export const envs = {
    port: envVars.PORT,
    stripeSecret: envVars.STRIPE_SECRET_KEY,
    stripeEndpointSecret: envVars.STRIPE_ENDPOINT_SECRET,
    stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
    stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
};