import { User } from "../../users/entities/user.entity";
export type RatingCode = "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
export declare class Series {
    id: number;
    title: string;
    year: number;
    reviewDetail: string;
    recommenderScore: number;
    ratingCode: RatingCode;
    owner: User;
    ownerId: number;
}
