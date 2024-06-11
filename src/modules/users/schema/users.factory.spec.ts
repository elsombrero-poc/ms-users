import { model } from "mongoose"
import { CryptoService } from "../../security/services/crypto/crypto.service"
import { usersFactory, usersMiddleware } from "./users.factory"
import { UserSchema } from "./users.schema"

describe('UserFactory', () => {
  let crypto: CryptoService;
  const value = UserSchema;
  const password = 'my-password';
  const schema = usersFactory(crypto) as typeof UserSchema;
  const UserModel = model('Users', schema);

  beforeAll(() => crypto = {hash: jest.fn()} as unknown as CryptoService)

  beforeEach(() => jest.clearAllMocks())

  it('should create the user schema after calling the pre save function', () => {
    const schema = usersFactory(crypto);

    expect(value).toEqual(schema);
  })

  it('should hash the password in save', async () => {
    const user = new UserModel()
    jest.spyOn(user, 'save').mockImplementation(async (args: any) => {
      usersMiddleware(crypto).apply({password});
      return args;
    })

    await user.save()

    expect(crypto.hash).toHaveBeenCalledTimes(1);
    expect(crypto.hash).toHaveBeenCalledWith(password);
  })

  it('should hash the password in updateOne', async () => {
    jest.spyOn(UserModel, 'updateOne').mockImplementation((args: any) => {
      usersMiddleware(crypto).apply({_update: {password}});
      return args;
    });

    await UserModel.updateOne({_id: '<id>'}, { password });

    expect(crypto.hash).toHaveBeenCalledTimes(1);
    expect(crypto.hash).toHaveBeenCalledWith(password);
  })

})