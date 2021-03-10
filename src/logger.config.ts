export const loggerConfig = {
    prettyPrint: {
        colorize: true, // --colorize
        errorLikeObjectKeys: ["err", "error"], // --errorLikeObjectKeys
        levelFirst: false, // --levelFirst
        messageKey: "msg", // --messageKey
        levelKey: "level", // --levelKey
        timestampKey: "time", // --timestampKey
        translateTime: false, // --translateTime
        ignore: "pid,hostname", // --ignore,
    },
};
