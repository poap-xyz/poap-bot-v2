export const loggerConfig = {
    name: "pino",
    level: process.env.LOG_LEVEL || 'debug',
    prettyPrint: {
        colorize: true, // --colorize
        errorLikeObjectKeys: ["err", "error"], // --errorLikeObjectKeys
        levelFirst: false, // --levelFirst
        messageKey: "msg", // --messageKey
        levelKey: "level", // --levelKey
        timestampKey: "time", // --timestampKey
        translateTime: true, // --translateTime
        ignore: "pid,hostname", // --ignore,
    },
};
