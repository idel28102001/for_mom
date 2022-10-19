import { Module } from '@nestjs/common';
import { GoogleService } from './services/google.service';
import { DatabaseModule } from '../database/database.module';
import { GoogleTokenEnum } from './enums/google.token.enum';

@Module({
  imports: [DatabaseModule],
  providers: [
    { useClass: GoogleService, provide: GoogleTokenEnum.GOOGLE_SERVICES_TOKEN },
  ],
  exports: [GoogleTokenEnum.GOOGLE_SERVICES_TOKEN],
})
export class GoogleModule {}
