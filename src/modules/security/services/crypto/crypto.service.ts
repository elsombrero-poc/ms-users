import { Inject, Injectable } from '@nestjs/common';
import { BCrypt } from '../../security.module';

@Injectable()
export class CryptoService {

  constructor(
    @Inject('BCRYPT') private bcrypt: BCrypt
  ){}

  public hash(value: string): string { return this.bcrypt.hashSync(value, 10); }

  public verify(clear: string, hashed: string): boolean {
    try{ return this.bcrypt.compareSync(clear, hashed); }
    catch(e){ return false; }
  }

}
