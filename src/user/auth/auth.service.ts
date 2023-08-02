import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'
import { UserType } from '@prisma/client';

interface SingupParams {
    name: string;
    phone: string;
    email: string;
    password: string;
}

@Injectable()
export class AuthService {

    constructor(private readonly prismaService: PrismaService) {}

    async signup({ email, password, name, phone  }: SingupParams) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if (userExists) {
            throw new ConflictException();
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.prismaService.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                userType: UserType.BUYER
            }
        })
    }
}
