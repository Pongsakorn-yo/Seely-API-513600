import { z } from "zod";
export declare const createReviewSchema: z.ZodObject<{
    seriesId: z.ZodNumber;
    score: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    seriesId: number;
    score: number;
    comment?: string | undefined;
}, {
    seriesId: number;
    score: number;
    comment?: string | undefined;
}>;
declare const CreateReviewDto_base: import("nestjs-zod").ZodDto<{
    seriesId: number;
    score: number;
    comment?: string | undefined;
}, z.ZodObjectDef<{
    seriesId: z.ZodNumber;
    score: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny>, {
    seriesId: number;
    score: number;
    comment?: string | undefined;
}>;
export declare class CreateReviewDto extends CreateReviewDto_base {
    seriesId: number;
    score: number;
    comment?: string;
}
export declare const listReviewsQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
declare const ListReviewsQueryDto_base: import("nestjs-zod").ZodDto<{
    page?: number | undefined;
    limit?: number | undefined;
}, z.ZodObjectDef<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny>, {
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare class ListReviewsQueryDto extends ListReviewsQueryDto_base {
    page?: number;
    limit?: number;
}
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export {};
