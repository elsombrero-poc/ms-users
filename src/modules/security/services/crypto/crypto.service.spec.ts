import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { ConfigModule } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { BCrypt } from '../../security.module';

describe('CryptoService', () => {
  let service: CryptoService;
  let _bcrypt: BCrypt;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        CryptoService,
        {
          provide: 'BCRYPT',
          useValue: bcrypt
        }
      ]
    }).compile();

    service = module.get<CryptoService>(CryptoService);
    _bcrypt = module.get<BCrypt>('BCRYPT');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash the password', () => {
    const password = 'my-password';
    const hashedPassword = '<hashed-password>';
    const hash = jest.spyOn(_bcrypt, 'hashSync').mockReturnValue(hashedPassword);

    const value = service.hash(password);

    expect(value).toEqual(hashedPassword);
    expect(hash).toHaveBeenCalledWith(password, 10);
  });

  it('should returns true if the password is verified', () => {
    const password = 'my-password';
    const hashedPassword = '<hashed-password>';
    const verify = jest.spyOn(_bcrypt, 'compareSync').mockReturnValue(true);

    const value = service.verify(password, hashedPassword);

    expect(value).toBeTruthy();
    expect(verify).toHaveBeenCalledWith(password, hashedPassword);
  });

  it('should returns false and error is throwed', () => {
    jest.spyOn(_bcrypt, 'compareSync').mockImplementation(() => { throw new Error() })

    const value = service.verify('', '');

    expect(value).toBeFalsy();
  });

});
