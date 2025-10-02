import { Repository } from "typeorm";
import { Review } from "./entities/review.entity";
import { Series } from "../series/entities/series.entity";
import { ListReviewsQuery } from "./dto";
export declare class ReviewsService {
    private readonly repo;
    private readonly seriesRepo;
    constructor(repo: Repository<Review>, seriesRepo: Repository<Series>);
    listBySeries(seriesId: number, q: ListReviewsQuery): Promise<{
        data: Review[];
        meta: {
            page: number;
            limit: number;
            itemCount: number;
            pageCount: number;
            hasNextPage: boolean;
        };
    }>;
    create(data: Partial<Review>, reviewerId: number): Promise<{
        stats: {
            averageScore: number;
            reviewCount: number;
        };
        id: number;
        seriesId: number;
        series: Series;
        reviewerId: number;
        reviewer: import("../users/entities/user.entity").User;
        score: number;
        comment?: string;
        createdAt: Date;
    }>;
}
