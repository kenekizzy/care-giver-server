/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, UserRole } from '../users/dto/create-user.dto';
import { CreateCaregiverDto } from '../users/dto/create-caregiver.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRole as PrismaUserRole } from 'generated/prisma';
import { DatabaseService } from '../database/database.service';
import { JwtPayload } from './strategies/jwt.strategy';
import * as bcrypt from 'bcrypt';
import { use } from 'passport';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  private mapUserRoleToEnum(role: UserRole): PrismaUserRole {
    switch (role) {
      case UserRole.CLIENT:
        return PrismaUserRole.CLIENT;
      case UserRole.CAREGIVER:
        return PrismaUserRole.CAREGIVER;
      case UserRole.ADMIN:
        return PrismaUserRole.ADMIN;
      default:
        return PrismaUserRole.CLIENT;
    }
  }

  async registerUser(createDto: CreateUserDto | CreateCaregiverDto) {
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createDto.password, saltRounds);

    const user = await this.databaseService.user.create({
      data: {
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        email: createDto.email,
        phone: createDto.phone,
        passwordHash: hashedPassword,
        role: this.mapUserRoleToEnum(createDto.role),
        isVerified: false,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const verificationLink = `http://localhost:3000/verify-me/token=${accessToken}`;

    const { passwordHash, ...result } = user;
    return { user: result, verificationLink };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestException('Email already verified');
      }

      await this.databaseService.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.databaseService.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'This account was created with social login. Please use the appropriate social login method.',
      );
    }

    if (user.isVerified === false) {
      throw new BadRequestException(
        'Please verify your email address before logging in.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const { passwordHash: userPassword, ...result } = user;

    return {
      user: result,
      token: accessToken,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // In a real app, you would:
    // 1. Generate a password reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  resetPassword(token: string, newPassword: string): { message: string } {
    // In a real app, you would:
    // 1. Validate the reset token
    // 2. Check if it's not expired
    // 3. Hash the new password
    // 4. Update the user's password
    // 5. Invalidate the reset token

    return { message: 'Password has been reset successfully.' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // In a real app, you would verify the current password
    // const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    // if (!isCurrentPasswordValid) {
    //   throw new UnauthorizedException('Current password is incorrect');
    // }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password (this would be a separate method in UsersService)
    // await this.usersService.updatePassword(userId, hashedNewPassword);

    return { message: 'Password changed successfully.' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.databaseService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const payloadForAccessToken: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(payloadForAccessToken);
      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async googleLogin(googleUser: any) {
    // Check if user exists with this email
    let user = await this.databaseService.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await this.databaseService.user.create({
        data: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          passwordHash: '', // No password for OAuth users
          role: PrismaUserRole.CLIENT, // Default role
          isVerified: true, // Google accounts are pre-verified
        },
      });
    } else {
      // Update user info if exists
      user = await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          isVerified: true,
        },
      });
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const { passwordHash, ...result } = user;

    return {
      user: result,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
