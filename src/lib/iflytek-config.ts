/**
 * iFlytek API Configuration
 * 
 * PROBLEM: If you are seeing "Missing iFlytek credentials" errors, it means the system
 * cannot read your .env file.
 * 
 * SOLUTION: Paste your API keys directly inside the quotes below.
 */
export const IFLYTEK_MANUAL_CONFIG = {
    // Paste your APPID here (e.g. '12345678')
    APP_ID: '',

    // Paste your APISecret here
    API_SECRET: '',

    // Paste your APIKey here
    API_KEY: ''
};

export const getIFlytekConfig = () => {
    // Try manual config first, then fall back to environment variables
    const appId = IFLYTEK_MANUAL_CONFIG.APP_ID || import.meta.env.VITE_IFLYTEK_APP_ID;
    const apiSecret = IFLYTEK_MANUAL_CONFIG.API_SECRET || import.meta.env.VITE_IFLYTEK_API_SECRET;
    const apiKey = IFLYTEK_MANUAL_CONFIG.API_KEY || import.meta.env.VITE_IFLYTEK_API_KEY;

    return {
        appId,
        apiSecret,
        apiKey
    };
};
