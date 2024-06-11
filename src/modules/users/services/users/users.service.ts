import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Users } from '../../schema/users.schema';
import { CryptoService } from '../../../security/services/crypto/crypto.service';
import { JwtService } from '../../../security/services/jwt/jwt.service';
import { CreateUser } from '../../../../common/grpc/msusers/CreateUser';
import { User } from '../../../../common/grpc/msusers/User';
import { UserToken } from '../../../../common/grpc/msusers/UserToken';
import { UserLogin } from '../../../../common/grpc/msusers/UserLogin';
import { SearchCriteria } from '../../../../common/grpc/SearchCriteria';
import { MessageResponse } from '../../../../common/grpc/MessageResponse';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel('Users') private UserModel: Model<Users>,
    private crypto: CryptoService,
    private jwt: JwtService,
  ){}

  public async create(user: CreateUser): Promise<User> {
    const u = await new this.UserModel(user).save()
    return { _id: u._id.toString(), email: u.email, profile: u.profile, }
  }

  public async login(user: UserLogin): Promise<UserToken> {
    const u = await this.UserModel.findOne({email: user.email});
    if(!this.crypto.verify(user.password, u.password)) throw new Error('Wrong password!');
    return { token: this.jwt.sign<User>({
      email: user.email,
      _id: u._id.toString(),
      profile: u.profile,
    }) };
  }

  public async update(_id: string, user: User): Promise<MessageResponse> {
    if((user as any).password) delete (user as any).password;
    await this.UserModel.updateOne({_id}, { ...user });
    return { message: `User updated for ${_id}!` };
  }

  public async updatePassword(_id: string, password: string): Promise<MessageResponse> {
    await this.UserModel.updateOne({_id}, { password });
    return { message: `Password updated for ${_id}!` };
  }

  public async remove(_id: string): Promise<MessageResponse> {
    await this.UserModel.deleteOne({_id});
    return { message: `The user: ${_id} was successfully removed!` };
  }

  public async find({fields, count = 0, page = 1, q}: SearchCriteria): Promise<User[]>{
    const users = (await this.UserModel.find(this.query(q), fields, 
      { limit: count || undefined, skip: count * (page - 1) }
    ));
    return users as unknown as User[];
  }

  private query(query: User): User {
    if(!query) return {}
    if(query._id) return { _id: query?._id, }
    return Object.keys(query)
    .reduce((user, current) => {
      return {...user, [current]: RegExp(query[current])}
    }, {} as User)
  }

}
