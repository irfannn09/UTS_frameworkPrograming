import { IsEnum } from 'class-validator';
import { AttendanceStatus } from '../entities/session-participant.entity';

// Yang boleh diubah dari sebuah pendaftaran hanyalah status kehadiran.
export class UpdateSessionParticipantDto {
  @IsEnum(AttendanceStatus)
  attendanceStatus: AttendanceStatus;
}
