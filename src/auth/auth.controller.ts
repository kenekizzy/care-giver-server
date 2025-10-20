/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  Get,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateCaregiverDto } from '../users/dto/create-caregiver.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { User } from '../users/entities/user.entity';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: User,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() createUserDto: CreateUserDto | CreateCaregiverDto) {
    return this.authService.registerUser(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/UserProfileDto' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Request() req) {
    return this.authService.verifyEmail(req.query.token);
  }

   @Post('forgot-password')
   @HttpCode(HttpStatus.OK)
   @ApiOperation({ summary: 'Request password reset' })
   @ApiResponse({
     status: 200,
     description: 'Password reset email sent',
     schema: {
       type: 'object',
       properties: {
         message: { type: 'string' },
       },
     },
   })
   async forgotPassword(
     @Body() forgotPasswordDto: ForgotPasswordDto,
   ): Promise<{ message: string }> {
     return this.authService.forgotPassword(forgotPasswordDto.email);
   }

  // @Post('reset-password')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Reset password with token' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password reset successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       message: { type: 'string' },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  // async resetPassword(
  //   @Body() resetPasswordDto: ResetPasswordDto,
  // ): Promise<{ message: string }> {
  //   return this.authService.resetPassword(
  //     resetPasswordDto.token,
  //     resetPasswordDto.newPassword,
  //   );
  // }

  // @Post('change-password/:userId')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Change user password' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Password changed successfully',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       message: { type: 'string' },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  // async changePassword(
  //   @Param('userId') userId: string,
  //   @Body() changePasswordDto: ChangePasswordDto,
  // ): Promise<{ message: string }> {
  //   return this.authService.changePassword(
  //     userId,
  //     changePasswordDto.currentPassword,
  //     changePasswordDto.newPassword,
  //   );
  // }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh authentication token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async refreshToken(
    @Body() body: { refresh_token: string },
  ) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth() {
    // This endpoint initiates the Google OAuth flow
    // The actual redirect is handled by the GoogleAuthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Google OAuth login successful',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  async googleAuthCallback(@Request() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with tokens as query parameters
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/auth/callback?access_token=${result.access_token}&refresh_token=${result.refresh_token}`;

    return res.redirect(redirectUrl);
  }
}
