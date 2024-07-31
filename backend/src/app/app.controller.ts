import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Retrieves the items from the app service.
   *
   * @return {Promise<Item[]>} A promise that resolves to an array of items.
   */
  @Get('items')
  getItems() {
    return this.appService.getItems();
  }

  /**
   * Saves the attachedIds data to the app service.
   *
   * @param {Object} data - The data object containing the attachedIds.
   * @param {number[]} data.attachedIds - An array of numbers representing the attachedIds.
   * @return {Promise<any>} A promise that resolves with the result of saving the attachedIds.
   */
  @Post('save')
  saveAttachedIds(@Body() data: { attachedIds: number[] }) {
    return this.appService.saveAttachedIds(data.attachedIds);
  }
}