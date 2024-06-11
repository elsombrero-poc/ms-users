import { Module, Scope } from '@nestjs/common';
import { JwtService } from './services/jwt/jwt.service';
import { CryptoService } from './services/crypto/crypto.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

export type BCrypt = typeof bcrypt;
export type JWT = typeof jwt;

@Module({
  providers: [
    {
      provide: 'BCRYPT',
      useValue: bcrypt,
    },
    {
      provide: 'JWT',
      useValue: jwt,
    },
    JwtService,
    CryptoService,
  ],
  exports: [JwtService, CryptoService]
})
export class SecurityModule {}
