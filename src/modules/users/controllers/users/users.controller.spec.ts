import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from '../../../security/security.module';
import { UsersService } from '../../services/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RpcException } from '@nestjs/microservices';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true}),
        SecurityModule,
      ],
      providers: [
        UsersService,
        {
          provide: getModelToken('Users'),
          useValue: Model,
        }
      ],
      controllers: [UsersController]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create the user with user service', async () => {
    const profile = { name: 'John', lastname: 'Doe', }
    const user = { email: 'test@test.com', password: 'MyPassword', profile, }
    const result = { ...user, _id: '<id>' }
    delete result.password

    const create = jest.spyOn(service, 'create').mockResolvedValue(result)

    const promise = controller.create(user)

    await expect(promise).resolves.toEqual(result)
    expect(create).toHaveBeenCalledWith(user)
  })

  it('should throw an error with message: "Error While creating user, the email is deplicated" if user creation fail', async () => {
    const profile = { name: 'John', lastname: 'Doe', }
    const user = { email: 'test@test.com', password: 'MyPassword', profile, }
    const result = new RpcException('Error While creating user, the email is deplicated')

    jest.spyOn(service, 'create').mockRejectedValue(result);

    const promise = controller.create(user);

    await expect(promise).rejects.toEqual(result);
  })

  it('should returns the token when the credential are correct', async () => {
    const credential = { email: 'test@test.com', password: 'my-correct-password' };
    const token = '<token>';

    const login = jest.spyOn(service, 'login').mockResolvedValue({token});

    const promise = controller.login(credential);

    await expect(promise).resolves.toEqual({token});
    expect(login).toHaveBeenCalledWith(credential);
  })

  it('should throw an error with message: "Error while login!" if authentication fail', async () => {
    const credential = { email: 'test@test.com', password: 'my-correct-password' };
    const result = new RpcException('Error while login!')

    jest.spyOn(service, 'login').mockRejectedValue(result);

    const promise = controller.login(credential);

    await expect(promise).rejects.toEqual(result);
  })

  it('should update an user and returns a MessageResponse', async () => {
    const id = '<id>'
    const user = { 'profile.name': 'John' }
    const response = { message: '' }

    const update = jest.spyOn(service, 'update').mockResolvedValue(response);

    const promise = controller.update({id, user});

    await expect(promise).resolves.toEqual(response);
    expect(update).toHaveBeenCalledWith(id, user);
  })

  it('should throw an Error if the update failed', async () => {
    const id = '<id>'
    const user = { 'profile.name': 'John' }
    const error = new RpcException('Error occured in update!')

    jest.spyOn(service, 'update').mockRejectedValue(error);

    const promise = controller.update({id, user});

    await expect(promise).rejects.toEqual(error);
  })

  it('should update user password and returns a MessageResponse', async () => {
    const id = '<id>'
    const password = 'password'
    const response = { message: '' }

    const update = jest.spyOn(service, 'updatePassword').mockResolvedValue(response);

    const promise = controller.updatePassword({id, password});

    await expect(promise).resolves.toEqual(response);
    expect(update).toHaveBeenCalledWith(id, password);
  })

  it('should throw an Error if the update failed', async () => {
    const id = '<id>'
    const password = 'password'
    const error = new RpcException('Error occured in update!')

    jest.spyOn(service, 'updatePassword').mockRejectedValue(error);

    const promise = controller.updatePassword({id, password});

    await expect(promise).rejects.toEqual(error);
  })

  it('should remove an user and returns a MessageResponse', async () => {
    const id = '<id>';
    const response = { message: '' };

    const remove = jest.spyOn(service, 'remove').mockResolvedValue(response);

    const promise = controller.remove({id});

    await expect(promise).resolves.toEqual(response);
    expect(remove).toHaveBeenCalledWith(id);
  })

  it('should throw an Error if the removing failed', async () => {
    const id = '<id>';
    const password = 'password';
    const error = new RpcException('Error while removing!');

    jest.spyOn(service, 'remove').mockRejectedValue(error);

    const promise = controller.remove({id});

    await expect(promise).rejects.toEqual(error);
  })

  it('should pass criteria in parameters and returns an array of user', async () => {
    const criteria = { q: { 'profile.name': 'John' } };
    const response = [];

    const find = jest.spyOn(service, 'find').mockResolvedValue(response);

    const promise = controller.find(criteria);

    await expect(promise).resolves.toEqual({users: response});
    expect(find).toHaveBeenCalledWith(criteria);
  })

  it('should throw an Error if an error occured', async () => {
    const criteria = { q: { 'profile.name': 'John' } };
    const error = new RpcException('An error occured!')

    jest.spyOn(service, 'find').mockRejectedValue(error);

    const promise = controller.find(criteria);

    await expect(promise).rejects.toEqual(error);
  })

});
