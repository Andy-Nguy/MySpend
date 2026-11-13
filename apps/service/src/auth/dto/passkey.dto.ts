import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class VerifyRegistrationDto {
  @IsObject()
  @IsNotEmpty()
  response!: RegistrationResponseJSON;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  deviceName?: string;
}

export class LoginOptionsDto {
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class VerifyAuthenticationDto {
  @IsObject()
  @IsNotEmpty()
  response!: AuthenticationResponseJSON;
}
