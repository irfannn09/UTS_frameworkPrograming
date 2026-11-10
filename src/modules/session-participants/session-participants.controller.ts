import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSessionParticipantDto } from './dto/create-session-participant.dto';
import { QuerySessionParticipantDto } from './dto/query-session-participant.dto';
import { UpdateSessionParticipantDto } from './dto/update-session-participant.dto';
import { SessionParticipantsService } from './session-participants.service';

@Controller('session-participants')
export class SessionParticipantsController {
  constructor(
    private readonly participantsService: SessionParticipantsService,
  ) {}

  @Post()
  create(@Body() dto: CreateSessionParticipantDto) {
    return this.participantsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QuerySessionParticipantDto) {
    return this.participantsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.participantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionParticipantDto,
  ) {
    return this.participantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.participantsService.remove(id);
  }
}
