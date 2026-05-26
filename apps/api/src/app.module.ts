import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";

import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { AssetsController } from "./assets/assets.controller";
import { AssetsService } from "./assets/assets.service";
import { CommentsController } from "./comments/comments.controller";
import { CommentsService } from "./comments/comments.service";
import { DashboardController } from "./dashboard/dashboard.controller";
import { DashboardService } from "./dashboard/dashboard.service";
import { ExhibitionsController } from "./exhibitions/exhibitions.controller";
import { ExhibitionsService } from "./exhibitions/exhibitions.service";
import { FormSchemasController } from "./form-schemas/form-schemas.controller";
import { FormSchemasService } from "./form-schemas/form-schemas.service";
import { GalleriesController } from "./galleries/galleries.controller";
import { GalleriesService } from "./galleries/galleries.service";
import { HealthController } from "./health/health.controller";
import { NotificationsController } from "./notifications/notifications.controller";
import { NotificationsService } from "./notifications/notifications.service";
import { PreferencesController } from "./preferences/preferences.controller";
import { PreferencesService } from "./preferences/preferences.service";
import { AppStateService } from "./persistence/app-state.service";
import { PrismaService } from "./persistence/prisma.service";
import { RegistrationsController } from "./registrations/registrations.controller";
import { RegistrationsService } from "./registrations/registrations.service";
import { ReviewsController } from "./reviews/reviews.controller";
import { ReviewsService } from "./reviews/reviews.service";
import { RolesController } from "./roles/roles.controller";
import { RolesService } from "./roles/roles.service";
import { SessionsController } from "./sessions/sessions.controller";
import { SessionsService } from "./sessions/sessions.service";
import { StampsController } from "./stamps/stamps.controller";
import { StampsService } from "./stamps/stamps.service";
import { UsersController } from "./users/users.controller";
import { UsersService } from "./users/users.service";
import { VenuesController } from "./venues/venues.controller";
import { VenuesService } from "./venues/venues.service";

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
    AssetsController,
    UsersController,
    RolesController,
    DashboardController,
    PreferencesController,
    NotificationsController,
    GalleriesController,
    ExhibitionsController,
    VenuesController,
    SessionsController,
    FormSchemasController,
    RegistrationsController,
    ReviewsController,
    CommentsController,
    StampsController
  ],
  providers: [
    PrismaService,
    AppStateService,
    AuthService,
    AssetsService,
    UsersService,
    RolesService,
    DashboardService,
    PreferencesService,
    NotificationsService,
    GalleriesService,
    ExhibitionsService,
    VenuesService,
    SessionsService,
    FormSchemasService,
    RegistrationsService,
    ReviewsService,
    CommentsService,
    StampsService
  ]
})
export class AppModule {}
