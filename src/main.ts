import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe global: semua DTO divalidasi otomatis sebelum masuk Controller
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // field di luar DTO dibuang
      forbidNonWhitelisted: true, // ...dan ditolak dengan 400
      transform: true, // payload diubah menjadi instance DTO (class-transformer)
    }),
  );

  // Error dari database (duplikat, foreign key) dipetakan ke status code HTTP
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
