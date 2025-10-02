import { ReviewsService } from "./reviews.service";
import { CreateReviewDto, ListReviewsQueryDto } from "./dto";
export declare class ReviewsController {
    private readonly service;
    constructor(service: ReviewsService);
    listBySeries(id: string, query: ListReviewsQueryDto): Promise<{
        data: import("./entities/review.entity").Review[];
        meta: {
            page: number;
            limit: number;
            itemCount: number;
            pageCount: number;
            hasNextPage: boolean;
        };
    }>;
    create(dto: CreateReviewDto, req: any): Promise<{
        stats: {
            averageScore: number;
            reviewCount: number;
        };
        id: number;
        seriesId: number;
        series: import("../series/entities/series.entity").Series;
        reviewerId: number;
        reviewer: import("../users/entities/user.entity").User;
        score: number;
        comment?: string;
        createdAt: Date;
    }>;
}
