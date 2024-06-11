import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JWT, SecurityModule } from '../../../security/security.module';
import { CryptoService } from '../../../security/services/crypto/crypto.service';
import { JwtService } from '../../../security/services/jwt/jwt.service';
import { Users } from '../../schema/users.schema';
import { SearchCriteria } from '../../../../common/grpc/SearchCriteria';

describe('UsersService', () => {
  let service: UsersService;
  let crypto: CryptoService;
  let jwt: JwtService;
  let UserModel: Model<Users>;
  const user = { email: 'john.doe@test.com', password: 'JohnDoe', };
  const profile = { name: 'John', lastname: 'Doe', };
  const result = {...user, profile, _id: '<id>'};
  delete result.password;
  const save = jest.fn();

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({isGlobal: true}),
        SecurityModule,
      ],
      providers: [
        UsersService,
        {
          provide: getModelToken('Users'),
          useValue: function(){
            return { save, }
          },
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    jwt = module.get<JwtService>(JwtService);
    crypto = module.get<CryptoService>(CryptoService);
    UserModel = module.get<Model<Users>>(getModelToken('Users'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an user', async () => {
    const u = { ...user, profile, };

    save.mockResolvedValue(result);

    await expect(service.create(u)).resolves.toEqual(result);
  });

  it('should returns the user token', async () => {
    const token = 'token';
    const payload = result;
    const sign = jest.spyOn(jwt, 'sign').mockReturnValue(token);
    const verify = jest.spyOn(crypto, 'verify').mockReturnValue(true);
    const password = '<hashed-password>'
    UserModel.findOne = jest.fn().mockReturnValue({...result, password });

    await expect(service.login(user)).resolves.toEqual({token});
    expect(sign).toHaveBeenCalledWith(payload);
    expect(verify).toHaveBeenCalledWith(user.password, password);
  })

  it('should throw a wrong password error if verify is false', async () => {
    jest.spyOn(crypto, 'verify').mockReturnValue(false);
    UserModel.findOne = jest.fn().mockReturnValue({...result, password: 'wrong-pass' });
    const error = new Error('Wrong password!')

    await expect(service.login(user)).rejects.toEqual(error);
  })

  it('should update an user information', async () => {
    const user = result;
    const _id = user._id;
    UserModel.updateOne = jest.fn();

    await expect(service.update(_id, user)).resolves.toHaveProperty('message');
    expect(UserModel.updateOne).toHaveBeenCalledWith({_id}, {...user});
  })

  it('should delete the password key if the password is passed', async () => {
    const user = {...result, password: 'PASS'};
    const _id = user._id;
    UserModel.updateOne = jest.fn();

    await expect(service.update(_id, user)).resolves.toHaveProperty('message');
    expect(UserModel.updateOne).toHaveBeenCalledWith({_id}, {...result});
  })

  
  it('should update the user password', async () => {
    const _id = '<id>';
    const password = '<password>'
    UserModel.updateOne = jest.fn();

    await expect(service.updatePassword(_id, password)).resolves.toHaveProperty('message');
    expect(UserModel.updateOne).toHaveBeenCalledWith({_id}, {password});
  })

  it('should remove an user by his id', async () => {
    const _id = '<id>';
    UserModel.deleteOne = jest.fn();

    await expect(service.remove(_id)).resolves.toHaveProperty('message');
    expect(UserModel.deleteOne).toHaveBeenCalledWith({_id});
  })

  it('should find an user with the specified criteria and parse the query to regex', async () => {
    const criteria: SearchCriteria = {
      fields: ['field'],
      count: 10,
      page: 1,
      q: {
        'profile.name': 'John'
      }
    };

    const query = { 'profile.name': RegExp('John') };
    UserModel.find = jest.fn().mockResolvedValue([result]);

    await expect(service.find(criteria)).resolves.toEqual([result]);
    expect(UserModel.find).toHaveBeenCalledWith(query, criteria.fields, {limit: 10, skip: 0});
  })

  it('should directly search by id if the id is passed', async () => {
    UserModel.find = jest.fn().mockResolvedValue([result]);
    const query = {q: {'_id': '<id>' }}
    await service.find(query)

    expect(UserModel.find).toHaveBeenCalledWith(query.q, undefined, {limit: undefined, skip: 0 });
  })

  it('should call the search method with an empty object if query is not passed', async () => {
    UserModel.find = jest.fn().mockResolvedValue([result]);
    const query = {q: undefined}
    await service.find(query)

    expect(UserModel.find).toHaveBeenCalledWith({}, undefined, {limit: undefined, skip: 0 });
  })

});
