import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type Userocument = HydratedDocument<Users>;

@Schema()
class UserProfile {
  @Prop({required: true})
  name: string

  @Prop({required: true})
  lastname: string
} 

@Schema()
export class Users {
  @Prop({required: true, unique: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({required: true})
  profile: UserProfile
}

export const UserSchema = SchemaFactory.createForClass(Users);