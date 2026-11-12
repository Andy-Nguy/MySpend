import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class VerifyRegistrationDto {
  @IsObject()
  @IsNotEmpty()
  response!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  deviceName?: string;
}

export class LoginOptionsDto {
  @IsString()
  @IsOptional()
  email?: string;
}

export class VerifyAuthenticationDto {
  @IsObject()
  @IsNotEmpty()
  response!: Record<string, unknown>;
}
