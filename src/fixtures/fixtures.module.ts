import { Module } from '@nestjs/common';
import { FixturesController } from './fixtures.controller';
import { FixturesService } from './fixtures.service';
import { HttpModule } from '@nestjs/axios';
import moment from 'moment';

@Module({
  imports: [HttpModule],
  controllers: [FixturesController],
  providers: [
    FixturesService,
    // {
    //   provide: 'MomentWrapper',
    //   useValue: moment,
    // },
  ],
})
export class FixturesModule {}
