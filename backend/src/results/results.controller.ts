import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ResultsService } from './results.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('results')
@UseGuards(AuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('history')
  async getHistory(@Request() req: any) {
    return this.resultsService.getHistory(req.user.id, req.token);
  }

  @Get(':id')
  async getResultById(@Request() req: any, @Param('id') id: string) {
    return this.resultsService.getResultById(id, req.token);
  }
}
