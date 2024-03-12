import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ItemDto } from '../dtos/item.dto';
import { ItemsService } from '../services/items.service';
import { CreateItemDto } from '../dtos/create-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ItemsInterceptor } from '../interceptors/items.interceptor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtAdminGuard, JwtAuthGuard } from 'src/guards';

@ApiTags('Item')
@ApiBearerAuth('JWT')
@UseInterceptors(ItemsInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private itemService: ItemsService,
  ) {}

  @Get('all')
  async getAllItems(): Promise<ItemDto[]> {
    const value = await this.cacheManager.get('itemsAll');
    if (value) {
      return Object(value);
    } else {
      const result = await this.itemService.findAll();
      await this.cacheManager.set('itemsAll', result, 10000);
      return result;
    }
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
    @Body() body: Partial<CreateItemDto>,
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
