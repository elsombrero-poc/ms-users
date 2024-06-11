import { Inject, Injectable } from '@nestjs/common';
import { JWT } from '../../security.module';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {

  constructor(
    @Inject('JWT') private jwt: JWT,
    private config: ConfigService,
  ){}

  public sign<T>(payload: T): string{
    return this.jwt.sign(payload as object, this.config.get('PRIVATE_JWT_KEY'));
  }

  public verify<T>(token: string): T {
    try { return this.jwt.verify(token, this.config.get('PRIVATE_JWT_KEY')) as T; }
    catch(e){ return null; }
  }

}
