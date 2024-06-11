import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { JWT } from '../../security.module';

describe('JwtService', () => {
  let service: JwtService;
  let config: ConfigService;
  let _jwt: JWT;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: 'JWT',
          useValue: jwt
        },
        JwtService,
      ]
    }).compile();

    service = module.get<JwtService>(JwtService);
    config = module.get<ConfigService>(ConfigService);
    _jwt = module.get<JWT>('JWT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate the token from payload and private key', () => {
    const privateKey = 'my-private-key';
    const token = 'token';
    const payload = { my: 'payload' };
    const sign = jest.spyOn(_jwt, 'sign').mockReturnValue(token as any);
    jest.spyOn(config, 'get').mockReturnValue(privateKey);

    const value = service.sign(payload);

    expect(value).toEqual(token);
    expect(sign).toHaveBeenCalledWith(payload, privateKey);
  });

  it('should verify the token an returns the payload if the token is correct', () => {
    const privateKey = 'my-private-key';
    const token = 'token';
    const payload = { my: 'payload' };
    const sign = jest.spyOn(_jwt, 'verify').mockReturnValue(payload as any);
    jest.spyOn(config, 'get').mockReturnValue(privateKey);

    const value = service.verify(token);

    expect(value).toEqual(payload);
    expect(sign).toHaveBeenCalledWith(token, privateKey);
  });

  it('should verify the token an returns null if the token is not correct', () => {
    jest.spyOn(_jwt, 'verify').mockImplementation(() => { throw new Error() });

    const value = service.verify('');

    expect(value).toBeNull();
  });

});
