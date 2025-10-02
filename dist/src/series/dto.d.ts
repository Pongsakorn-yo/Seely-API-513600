import { z } from "zod";
export declare const ratingEnum: z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>;
export declare const createSeriesSchema: z.ZodObject<{
    title: z.ZodString;
    year: z.ZodNumber;
    reviewDetail: z.ZodString;
    recommenderScore: z.ZodNumber;
    ratingCode: z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>;
}, "strip", z.ZodTypeAny, {
    year: number;
    title: string;
    reviewDetail: string;
    recommenderScore: number;
    ratingCode: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}, {
    year: number;
    title: string;
    reviewDetail: string;
    recommenderScore: number;
    ratingCode: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}>;
declare const CreateSeriesDto_base: import("nestjs-zod").ZodDto<{
    year: number;
    title: string;
    reviewDetail: string;
    recommenderScore: number;
    ratingCode: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}, z.ZodObjectDef<{
    title: z.ZodString;
    year: z.ZodNumber;
    reviewDetail: z.ZodString;
    recommenderScore: z.ZodNumber;
    ratingCode: z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>;
}, "strip", z.ZodTypeAny>, {
    year: number;
    title: string;
    reviewDetail: string;
    recommenderScore: number;
    ratingCode: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}>;
export declare class CreateSeriesDto extends CreateSeriesDto_base {
    title: string;
    year: number;
    reviewDetail: string;
    recommenderScore: number;
    ratingCode: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}
export declare const updateSeriesSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    reviewDetail: z.ZodOptional<z.ZodString>;
    recommenderScore: z.ZodOptional<z.ZodNumber>;
    ratingCode: z.ZodOptional<z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>>;
}, "strip", z.ZodTypeAny, {
    year?: number | undefined;
    title?: string | undefined;
    reviewDetail?: string | undefined;
    recommenderScore?: number | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
}, {
    year?: number | undefined;
    title?: string | undefined;
    reviewDetail?: string | undefined;
    recommenderScore?: number | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
}>;
declare const UpdateSeriesDto_base: import("nestjs-zod").ZodDto<{
    year?: number | undefined;
    title?: string | undefined;
    reviewDetail?: string | undefined;
    recommenderScore?: number | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
}, z.ZodObjectDef<{
    title: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodNumber>;
    reviewDetail: z.ZodOptional<z.ZodString>;
    recommenderScore: z.ZodOptional<z.ZodNumber>;
    ratingCode: z.ZodOptional<z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>>;
}, "strip", z.ZodTypeAny>, {
    year?: number | undefined;
    title?: string | undefined;
    reviewDetail?: string | undefined;
    recommenderScore?: number | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
}>;
export declare class UpdateSeriesDto extends UpdateSeriesDto_base {
    title?: string;
    year?: number;
    reviewDetail?: string;
    recommenderScore?: number;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}
export declare const listSeriesQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    ratingCode: z.ZodOptional<z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}, {
    search?: string | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
declare const ListSeriesQueryDto_base: import("nestjs-zod").ZodDto<{
    search?: string | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}, z.ZodObjectDef<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    ratingCode: z.ZodOptional<z.ZodEnum<["ส", "ท", "น13+", "น15+", "น18+", "ฉ20+"]>>;
}, "strip", z.ZodTypeAny>, {
    search?: string | undefined;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export declare class ListSeriesQueryDto extends ListSeriesQueryDto_base {
    page?: number;
    limit?: number;
    search?: string;
    ratingCode?: "ส" | "ท" | "น13+" | "น15+" | "น18+" | "ฉ20+";
}
export type ListSeriesQuery = z.infer<typeof listSeriesQuerySchema>;
export {};
