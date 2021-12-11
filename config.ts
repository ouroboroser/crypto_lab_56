require("dotenv").config();

export const config: any = {
  database: {
    name: "default",
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: true,
    logging: false,
    ssl: false,
    entities: ["src/**/entities/*.ts", "build/src/**/entities/*.js"],
    migrations: ["./build/migrations/*.js"],
    cli: {
      migrationsDir: "./migrations",
    },
  },
  port: process.env.PORT,
  key: process.env.KEY,
  jwt: {
    key: process.env.JWT_KEY,
    expiresIn: Number(String(process.env.JWT_EXPIRES_IN)),
  },
  kms: {
    projectId: process.env.PROJECT_ID,
    locationId: process.env.LOCATION_ID,
    keyRingId: process.env.KEY_RING_ID,
    keyId: process.env.KEY_ID
  }
};