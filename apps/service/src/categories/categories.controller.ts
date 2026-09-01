import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './categories.service';

interface IAuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Req() req: IAuthenticatedRequest, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active categories for the authenticated user' })
  findAll(@Req() req: IAuthenticatedRequest) {
    return this.categoriesService.findAllActive(req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category name or icon (type cannot be changed)' })
  update(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a category' })
  remove(
    @Req() req: IAuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.categoriesService.remove(req.user.userId, id);
  }
}
