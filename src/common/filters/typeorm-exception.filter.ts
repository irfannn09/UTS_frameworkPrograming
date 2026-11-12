import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Menangkap error dari database (TypeORM) dan mengubahnya menjadi HTTP status
 * code yang tepat. Ini adalah "jaring pengaman" di level database:
 *  - 23505 unique_violation       -> 409 Conflict (data duplikat)
 *  - 23503 foreign_key_violation  -> 409 Conflict (data masih dipakai data lain)
 *  - 22003 numeric out of range   -> 400 Bad Request
 */
@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const driverError = exception.driverError as {
      code?: string;
      detail?: string;
    };

    let statusCode = 500;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    switch (driverError?.code) {
      case '23505':
        statusCode = 409;
        error = 'Conflict';
        message = `Data duplikat: ${driverError.detail ?? 'nilai unik sudah digunakan'}`;
        break;
      case '23503':
        statusCode = 409;
        error = 'Conflict';
        message =
          'Operasi ditolak karena data masih berhubungan dengan data lain (foreign key)';
        break;
      case '22003':
        statusCode = 400;
        error = 'Bad Request';
        message = 'Nilai angka berada di luar jangkauan yang diizinkan';
        break;
      default:
        this.logger.error(exception.message, exception.stack);
    }

    response.status(statusCode).json({ statusCode, message, error });
  }
}
