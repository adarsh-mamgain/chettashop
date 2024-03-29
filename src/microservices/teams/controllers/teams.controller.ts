import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TeamsService } from '../services';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateTeamDto } from '../dtos';
import { TeamsInterceptor } from '../interceptors';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

// import { TeamOwnerGuard } from 'src/guards/teamOwner.guard';

@ApiTags('Team')
@ApiBearerAuth('JWT')
@UseInterceptors(TeamsInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('teams')
// @UseGuards(TeamOwnerGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post('member/:id')
  addMember(@Request() req, @Param('id') id: string) {
    return this.teamsService.addMember(req.user.userId, parseInt(id));
  }

  @Delete('member/:id')
  deleteMember(@Request() req, @Param('id') id: string) {
    return this.teamsService.deleteMember(req.user.userId, parseInt(id));
  }

  @Get('all')
  allTeam() {
    return this.teamsService.findAll();
  }

  @Post()
  create(@Request() req, @Body() body: CreateTeamDto) {
    return this.teamsService.create({ ...body, ownerId: req.user.userId });
  }

  @Get(':id')
  findTeam(@Param('id') id: string) {
    return this.teamsService.findOne(parseInt(id));
  }

  @Put(':id')
  updateTeam(@Param('id') id: string, @Body() body: CreateTeamDto) {
    return this.teamsService.update(parseInt(id), body);
  }

  @Delete(':id')
  deleteTeam(@Request() req) {
    return this.teamsService.delete(req.user.userId);
  }
}
