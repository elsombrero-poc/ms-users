import { CryptoService } from '../../security/services/crypto/crypto.service';
import { UserSchema } from './users.schema';

export const usersFactory = (crypto: CryptoService) => {
  const schema = UserSchema
  schema.pre('save', usersMiddleware(crypto));
  schema.pre('updateOne', usersMiddleware(crypto))
  return schema
}

export const usersMiddleware = (crypto: CryptoService) => {
  return function(){
    if(this?._update?.password) this._update.password = crypto.hash(this._update.password);
    else this.password = crypto.hash(this.password);
  }
}