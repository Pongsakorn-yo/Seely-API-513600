import { Series } from "../../series/entities/series.entity";
import { User } from "../../users/entities/user.entity";
export declare class Review {
    id: number;
    seriesId: number;
    series: Series;
    reviewerId: number;
    reviewer: User;
    score: number;
    comment?: string;
    createdAt: Date;
}
