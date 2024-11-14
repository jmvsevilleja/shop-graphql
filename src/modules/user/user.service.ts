import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { CreateUserInput, UpdateUserInput } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserInput: CreateUserInput): Promise<User> {
    const { password, ...rest } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = new this.userModel({
      ...rest,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findUserById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async findAllUsers(): Promise<User[]> {
    return this.userModel.find();
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    await this.userModel.deleteOne({ _id: id });
    return user;
  }

  async updateUser(id: string, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserInput, { new: true });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}