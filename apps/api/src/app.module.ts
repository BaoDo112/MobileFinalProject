import { Module } from "@nestjs/common";

import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { CommentsController } from "./comments/comments.controller";
import { CommentsService } from "./comments/comments.service";
import { ExhibitionsController } from "./exhibitions/exhibitions.controller";
import { ExhibitionsService } from "./exhibitions/exhibitions.service";
import { GalleriesController } from "./galleries/galleries.controller";
import { GalleriesService } from "./galleries/galleries.service";
import { HealthController } from "./health/health.controller";
import { StampsController } from "./stamps/stamps.controller";
import { StampsService } from "./stamps/stamps.service";

@Module({
  imports: [],
  controllers: [
    HealthController,
    AuthController,
    GalleriesController,
    ExhibitionsController,
    CommentsController,
    StampsController
  ],
  providers: [AuthService, GalleriesService, ExhibitionsService, CommentsService, StampsService]
})
export class AppModule {}
