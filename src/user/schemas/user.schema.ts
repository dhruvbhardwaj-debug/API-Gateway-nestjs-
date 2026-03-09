import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { role } from '../user.types';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User{
    @Prop({required:true})
    fname:string;
    @Prop({required:true})
    lname:string;
    @Prop({required:true,unique:true})
    email:string;
    @Prop({required:true})
    password:string;
    @Prop({default:role.User})
    role:string;

    @Prop({ required: true, unique: true, index: true })
    slug: string;
}

export const UserSchema = SchemaFactory.createForClass(User);