"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const nestjs_zod_1 = require("nestjs-zod");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new nestjs_zod_1.ZodValidationPipe());
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Seely API")
        .setDescription("Community series recommendations and reviews")
        .setVersion("0.1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document);
    const cfg = app.get(config_1.ConfigService);
    const port = cfg.get("PORT") || 3000;
    await app.listen(port);
    console.log(`\n🚀 Seely API running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map