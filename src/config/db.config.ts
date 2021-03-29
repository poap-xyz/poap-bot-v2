export const DBConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "mysecretpassword",
    database: process.env.DB_DATABASE || "",
}

