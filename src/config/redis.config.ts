export const RedisConfig = {
    port: 6379, // matches with first port # after -p above
    host: process.env.REDIS_HOST || '127.0.0.1'
};