import { Body, Controller, Get, Headers, Param, Put, Query } from "@nestjs/common";
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";

import { getBearerToken } from "../common/auth-header";
import { ReviewsService } from "./reviews.service";

class SaveReviewBodyDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MinLength(24)
  content!: string;
}

class ReviewHubQueryDto {
  @IsString()
  exhibitionId!: string;
}

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("hub")
  hub(@Headers("authorization") authorization: string | undefined, @Query() query: ReviewHubQueryDto) {
    return this.reviewsService.getHub(getBearerToken(authorization), query.exhibitionId);
  }

  @Put(":exhibitionId")
  save(
    @Param("exhibitionId") exhibitionId: string,
    @Headers("authorization") authorization: string | undefined,
    @Body() payload: SaveReviewBodyDto,
  ) {
    return this.reviewsService.saveReview(getBearerToken(authorization), exhibitionId, payload);
  }
}