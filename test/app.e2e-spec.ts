import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import request from "supertest";
import { ZodValidationPipe } from "nestjs-zod";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { SeriesModule } from "../src/series/series.module";
import { ReviewsModule } from "../src/reviews/reviews.module";
import { User } from "../src/users/entities/user.entity";
import { Series } from "../src/series/entities/series.entity";
import { Review } from "../src/reviews/entities/review.entity";

describe("Seely API e2e", () => {
  let app: INestApplication;
  let server: any;
  let ownerToken: string;
  let reviewerToken: string;
  let createdSeriesId: number;

  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "3600s";
    process.env.REFRESH_JWT_SECRET = "refresh-secret";
    process.env.REFRESH_JWT_EXPIRES_IN = "7d";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          dropSchema: true,
          entities: [User, Series, Review],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        SeriesModule,
        ReviewsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("registers and logs in the recommender", async () => {
    const registerRes = await request(server)
      .post("/api/v1/auth/register")
      .send({ username: "owner", password: "password123" })
      .expect(201);

    expect(registerRes.body).toMatchObject({ username: "owner", role: "USER" });
    expect(registerRes.body.password).toBeUndefined();

    const loginRes = await request(server)
      .post("/api/v1/auth/login")
      .send({ username: "owner", password: "password123" })
      .expect(201);

    expect(loginRes.body).toHaveProperty("accessToken");
    ownerToken = loginRes.body.accessToken;
  });

  it("allows the recommender to create a series", async () => {
    const payload = {
      title: "My Test Series",
      year: 2024,
      reviewDetail: "A great series to learn from.",
      recommenderScore: 4.5,
      ratingCode: "ท",
    };

    const res = await request(server)
      .post("/api/v1/series")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(payload)
      .expect(201);

    expect(res.body).toMatchObject({
      title: payload.title,
      ownerId: expect.any(Number),
      ratingCode: payload.ratingCode,
    });
    createdSeriesId = res.body.id;
  });

  it("lists series with default pagination and zeroed stats", async () => {
    const res = await request(server).get("/api/v1/series").expect(200);

    expect(res.body.meta).toMatchObject({ page: 1, limit: 10, itemCount: 1 });
    expect(res.body.data[0]).toMatchObject({
      id: createdSeriesId,
      stats: { averageScore: 0, reviewCount: 0 },
    });
  });

  it("registers and logs in a reviewer", async () => {
    await request(server)
      .post("/api/v1/auth/register")
      .send({ username: "reviewer", password: "password123" })
      .expect(201);

    const loginRes = await request(server)
      .post("/api/v1/auth/login")
      .send({ username: "reviewer", password: "password123" })
      .expect(201);

    reviewerToken = loginRes.body.accessToken;
  });

  it("allows the reviewer to leave a review and updates stats", async () => {
    const reviewRes = await request(server)
      .post("/api/v1/reviews")
      .set("Authorization", `Bearer ${reviewerToken}`)
      .send({ seriesId: createdSeriesId, score: 4, comment: "Loved it!" })
      .expect(201);

    expect(reviewRes.body).toMatchObject({
      seriesId: createdSeriesId,
      reviewerId: expect.any(Number),
      stats: { averageScore: 4, reviewCount: 1 },
    });

    const seriesList = await request(server).get("/api/v1/series").expect(200);
    expect(seriesList.body.data[0].stats).toEqual({
      averageScore: 4,
      reviewCount: 1,
    });
  });

  it("prevents non-owners from updating a series", async () => {
    await request(server)
      .patch(`/api/v1/series/${createdSeriesId}`)
      .set("Authorization", `Bearer ${reviewerToken}`)
      .send({ title: "Hacked Title" })
      .expect(403);
  });

  it("allows the owner to update their series", async () => {
    const res = await request(server)
      .patch(`/api/v1/series/${createdSeriesId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ recommenderScore: 3.5 })
      .expect(200);

    expect(res.body.recommenderScore).toBeCloseTo(3.5);
  });

  it("returns series details with sanitized owner and aggregated stats", async () => {
    const res = await request(server)
      .get(`/api/v1/series/${createdSeriesId}`)
      .expect(200);

    expect(res.body.owner).toMatchObject({ username: "owner" });
    expect(res.body.owner.password).toBeUndefined();
    expect(res.body.stats).toEqual({ averageScore: 4, reviewCount: 1 });
  });
});
