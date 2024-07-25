
class AppConfig {
    public readonly backendUrl = process.env.REACT_APP_BACKEND_URL;
}

export const appConfig = new AppConfig();
