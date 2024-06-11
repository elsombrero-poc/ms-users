import { Controller, UsePipes } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../../../common/grpc/msusers/User';
import { UserToken } from '../../../../common/grpc/msusers/UserToken';
import { UserLogin } from '../../../../common/grpc/msusers/UserLogin';
import { CreateUser } from '../../../../common/grpc/msusers/CreateUser';
import { UpdateUser } from '../../../../common/grpc/msusers/UpdateUser';
import { SearchCriteria } from '../../../../common/grpc/SearchCriteria';
import { FindUsers } from '../../../../common/grpc/msusers/FindUsers';
import { MessageResponse } from '../../../../common/grpc/MessageResponse';
import { IdUser } from '../../../../common/grpc/msusers/IdUser';
import { UpdatePassword } from '../../../../common/grpc/msusers/UpdatePassword';

@Controller()
export class UsersController {

  constructor(private usersService: UsersService){ }

  @GrpcMethod('UsersService')
  public async create(user: CreateUser): Promise<User> {
    try{ return await this.usersService.create(user); }
    catch(e){ throw new RpcException('Error While creating user, the email is deplicated') }
  }

  @GrpcMethod('UsersService')
  public async login(user: UserLogin): Promise<UserToken> {
    try{ return await this.usersService.login(user); }
    catch(e){ throw new RpcException('Error while login!') }
  }

  @GrpcMethod('UsersService')
  public async update({id, user}: UpdateUser): Promise<MessageResponse> {
    try{ return await this.usersService.update(id, user); }
    catch(e){ throw new RpcException('Error occured in update!') }
  }

  @GrpcMethod('UsersService')
  public async find(criteria: SearchCriteria): Promise<FindUsers> {
    try{ return { users: await this.usersService.find(criteria) }; }
    catch(e){ throw new RpcException('An error occured!') }
  }

  @GrpcMethod('UsersService')
  public async remove({id}: IdUser): Promise<MessageResponse> {
    try{ return await this.usersService.remove(id) ; }
    catch(e){ throw new RpcException('Error while removing!') }
  }

  @GrpcMethod('UsersService')
  public async updatePassword({id, password}: UpdatePassword): Promise<MessageResponse> {
    try{ return await this.usersService.updatePassword(id, password); }
    catch(e){ throw new RpcException('Error occured in update!') }
  }

}
