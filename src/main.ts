import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import path from 'path';

async function bootstrap() {
  const config = new ConfigService()
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: config.get('PACKAGE_NAME'),
      protoPath: [
        path.join(__dirname, '../protos/users.proto')
      ],
      url: config.get('URL'),
    }
  });
  await app.listen();
}
bootstrap();
