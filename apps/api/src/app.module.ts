import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { CommentsController } from "./comments/comments.controller";
import { CommentsService } from "./comments/comments.service";
import { ExhibitionsController } from "./exhibitions/exhibitions.controller";
import { ExhibitionsService } from "./exhibitions/exhibitions.service";
import { GalleriesController } from "./galleries/galleries.controller";
import { GalleriesService } from "./galleries/galleries.service";
import { HealthController } from "./health/health.controller";
import { PreferencesController } from "./preferences/preferences.controller";
import { PreferencesService } from "./preferences/preferences.service";
import { RolesController } from "./roles/roles.controller";
import { RolesService } from "./roles/roles.service";
import { StampsController } from "./stamps/stamps.controller";
import { StampsService } from "./stamps/stamps.service";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "arthera-dev-secret",
      signOptions: { expiresIn: "7d" }
    }),
    ScheduleModule.forRoot()
  ],
  controllers: [
    HealthController,
    AuthController,
    UsersController,
    RolesController,
    PreferencesController,
    GalleriesController,
    ExhibitionsController,
    CommentsController,
    StampsController
  ],
  providers: [
    AuthService,
    UsersService,
    RolesService,
    PreferencesService,
    GalleriesService,
    ExhibitionsService,
    CommentsService,
    StampsService
  ]
})
export class AppModule {}
