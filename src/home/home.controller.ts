import { Controller, Get, Param, Post, Put, Delete, Query, ParseIntPipe, Body, UnauthorizedException } from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, UpdateHomeDto } from './dto/home.dto';
import { PropertyType, UserType } from '@prisma/client';
import { User, UserInfo } from 'src/user/decorators/user.decorator';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService) {}

    @Get()
    getHomes(
        @Query('city') city?: string, 
        @Query('minPrice') minPrice?: string, 
        @Query('maxPrice') maxPrice?: string, 
        @Query('propertyType') propertyType?: PropertyType, 
    ): Promise<HomeResponseDto[]> {

        const price = minPrice || maxPrice ? {
            ...(minPrice && {gte: parseFloat(minPrice)}),
            ...(maxPrice && {lte: parseFloat(maxPrice)})
        } : undefined

        const filters = {
            ...(city && {city}),
            ...(price && {price}),
            ...(propertyType && {propertyType})
        }

        return this.homeService.getHomes(filters)
    }

    @Get(':id')
    getHome(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.homeService.getHome(id)
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Post()
    createHome(
        @Body() body: CreateHomeDto,
        @User() user: UserInfo
    ) {
        console.log(user)
        return this.homeService.createHome(body, user.id)
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Put(':id')
    async updateHome(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getRealtorByHome(id)

        if (realtor.id !== user.id) {
            throw new UnauthorizedException()
        }

        return this.homeService.updateHomeById(id, body)
    }

    @Roles(UserType.REALTOR, UserType.ADMIN)
    @Delete(':id')
    async deleteHome(
        @Param('id', ParseIntPipe) id: number,
        @User() user: UserInfo
    ) {
        const realtor = await this.homeService.getRealtorByHome(id)

        if (realtor.id !== user.id) {
            throw new UnauthorizedException()
        }

        return this.homeService.deleteHomeById(id)
    }
}
