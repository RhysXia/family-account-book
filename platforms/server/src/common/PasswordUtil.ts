import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class PasswordUtil {
  private secret: string;

  constructor(configService: ConfigService) {
    this.secret = configService.getOrThrow<string>('PASSWORD_SECRET');
  }

  encode(password: string): string {
    return crypto
      .createHmac('sha1', this.secret)
      .update(password)
      .digest('base64');
  }

  match(password, encodedPassword) {
    return this.encode(password) === encodedPassword;
  }
}
