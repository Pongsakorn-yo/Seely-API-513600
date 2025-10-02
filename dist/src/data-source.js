"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.dataSourceOptions = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./users/entities/user.entity");
const series_entity_1 = require("./series/entities/series.entity");
const review_entity_1 = require("./reviews/entities/review.entity");
config_1.ConfigModule.forRoot();
const config = new config_1.ConfigService();
const databaseUrl = config.get("DATABASE_URL");
const entities = [user_entity_1.User, series_entity_1.Series, review_entity_1.Review];
const commonOptions = {
    entities,
    synchronize: true,
    logging: true,
    migrations: ["dist/migrations/*.js"],
    migrationsTableName: "migrations",
};
exports.dataSourceOptions = databaseUrl
    ? {
        type: "postgres",
        url: databaseUrl,
        ssl: process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        ...commonOptions,
    }
    : {
        type: "sqlite",
        database: "seely-dev.sqlite",
        ...commonOptions,
    };
exports.AppDataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
//# sourceMappingURL=data-source.js.map