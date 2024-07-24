import dotenv from "dotenv";

// Load ".env" file into process.env object:
dotenv.config();

class AppConfig {
    public readonly port = process.env.PORT;
    public readonly mongodbConnectionString = process.env.MONGODB_CONNECTION_STRING;
}

export const appConfig = new AppConfig();
