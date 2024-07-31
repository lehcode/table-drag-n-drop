import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('items')
  getItems() {
    return this.appService.getItems();
  }

  @Post('save')
  saveAttachedIds(@Body() data: { attachedIds: string[] }) {
    return this.appService.saveAttachedIds(data.attachedIds);
  }
}