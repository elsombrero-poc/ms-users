import { Module } from '@nestjs/common';
import { UsersService } from './services/users/users.service';
import { UsersController } from './controllers/users/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { usersFactory } from './schema/users.factory';
import { SecurityModule } from '../security/security.module';
import { CryptoService } from '../security/services/crypto/crypto.service';

@Module({
  imports: [
    SecurityModule,
    MongooseModule.forFeatureAsync([
      {
        name: 'Users',
        imports: [SecurityModule],
        inject: [CryptoService],
        useFactory: usersFactory,
      }
    ])
  ],
  providers: [
    UsersService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
