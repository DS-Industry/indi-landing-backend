import * as process from 'process';

export const configuration = () => ({
    NODE_ENV: process.env.NODE_ENV,
    port: parseInt(process.env.APP_PORT, 10) || 5001,
    appName: process.env.APP_NAME,
    rp:{
        key_id: process.env.RP_KEY_ID,
        key_secret: process.env.RP_KEY_SECRET,
    },
    gvlSource: process.env.GVL_SOURCE,
    dsCloudUrl: process.env.DS_CLOUD_URL,
    dsCloudApiKey: process.env.DS_CLOUD_API_KEY,
});