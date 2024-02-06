import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { ItemDto } from './dtos/item.dto';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dtos/create-item.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAdminGuard } from 'src/guards/jwt-admin.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ItemsInterceptor } from './items.interceptor';

@ApiTags('Item')
@Controller('items')
@UseGuards(JwtAuthGuard)
@Serialize(ItemDto)
@UseInterceptors(ItemsInterceptor)
export class ItemsController {
  constructor(private itemService: ItemsService) {}

  @Get('all')
  getAllItems(): Promise<ItemDto[]> {
    return this.itemService.findAll();
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  async createItems(@Body() body: CreateItemDto): Promise<ItemDto> {
    const item = await this.itemService.create(
      body.name,
      body.price,
      body.quantity,
    );
    return item;
  }

  @Get('/:id')
  getItem(@Param('id') id: string): Promise<ItemDto> {
    return this.itemService.findOne(parseInt(id));
  }

  @Put('/:id')
  @UseGuards(JwtAdminGuard)
  async updateItem(
    @Param('id') id: string,
    @Body() body: CreateItemDto,
  ): Promise<ItemDto> {
    const item = this.itemService.update(parseInt(id), body);
    return item;
  }

  @Delete('/:id')
  @UseGuards(JwtAdminGuard)
  removeItem(@Param('id') id: string): Promise<ItemDto> {
    return this.itemService.remove(parseInt(id));
  }
}
