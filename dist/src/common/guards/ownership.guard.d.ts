import { CanActivate, ExecutionContext } from "@nestjs/common";
import { SeriesService } from "../../series/series.service";
export declare class OwnershipGuard implements CanActivate {
    private readonly seriesService;
    constructor(seriesService: SeriesService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
