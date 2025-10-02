import { Repository } from "typeorm";
import { Series } from "./entities/series.entity";
import { ListSeriesQuery } from "./dto";
export declare class SeriesService {
    private readonly repo;
    constructor(repo: Repository<Series>);
    findOwnerId(seriesId: number): Promise<number | undefined>;
    list(q: ListSeriesQuery): Promise<{
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
    findOne(id: number): Promise<{
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
    create(data: Partial<Series>, ownerId: number): Promise<Series>;
    update(id: number, data: Partial<Series>): Promise<Series>;
    remove(id: number): Promise<void>;
}
