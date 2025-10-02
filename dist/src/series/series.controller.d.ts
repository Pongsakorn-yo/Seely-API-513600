import { SeriesService } from "./series.service";
import { CreateSeriesDto, ListSeriesQueryDto, UpdateSeriesDto } from "./dto";
export declare class SeriesController {
    private readonly service;
    constructor(service: SeriesService);
    list(query: ListSeriesQueryDto): Promise<{
        data: {
            stats: {
                averageScore: number;
                reviewCount: number;
            };
            id: number;
            title: string;
            year: number;
            reviewDetail: string;
            recommenderScore: number;
            ratingCode: import("./entities/series.entity").RatingCode;
            owner: import("../users/entities/user.entity").User;
            ownerId: number;
        }[];
        meta: {
            page: number;
            limit: number;
            itemCount: number;
            pageCount: number;
            hasNextPage: boolean;
        };
    }>;
    findOne(id: string): Promise<{
        stats: {
            averageScore: number;
            reviewCount: number;
        };
        id: number;
        title: string;
        year: number;
        reviewDetail: string;
        recommenderScore: number;
        ratingCode: import("./entities/series.entity").RatingCode;
        owner: import("../users/entities/user.entity").User;
        ownerId: number;
    }>;
    create(dto: CreateSeriesDto, req: any): Promise<import("./entities/series.entity").Series>;
    update(id: string, dto: UpdateSeriesDto): Promise<import("./entities/series.entity").Series>;
    remove(id: string): Promise<void>;
}
