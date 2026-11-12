import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersModule } from './modules/members/members.module';
import { MembershipPlansModule } from './modules/membership-plans/membership-plans.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { SessionParticipantsModule } from './modules/session-participants/session-participants.module';
import { TrainersModule } from './modules/trainers/trainers.module';
import { TrainingSessionsModule } from './modules/training-sessions/training-sessions.module';

@Module({
  imports: [
    // Membaca file .env dan menyediakan ConfigService ke seluruh aplikasi
    ConfigModule.forRoot({ isGlobal: true }),

    // Koneksi ke PostgreSQL. forRootAsync dipakai karena nilai koneksi
    // diambil dari ConfigService (yang bergantung pada .env).
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true, // entity dari forFeature() otomatis dikenali
        synchronize: true, // tabel dibuat/disesuaikan otomatis dari entity (khusus development)
      }),
    }),

    MembersModule,
    TrainersModule,
    MembershipPlansModule,
    MembershipsModule,
    TrainingSessionsModule,
    SessionParticipantsModule,
  ],
})
export class AppModule {}
