import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { User } from './user.schema';
import { CreateUserInput } from './user.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get<UserService>(UserService);
  });

  describe('me', () => {
    it('should return the current user', async () => {
      const user = new User();
      user.id = '1';
      user.email = 'test@example.com';

      const context = { user }; // Mock context with current user
      const result = await resolver.me(context.user);
      expect(result).toEqual(user);
    });
  });

  describe('users', () => {
    it('should return an array of users', async () => {
      const users = [new User(), new User()];
      mockUserService.findAll.mockReturnValue(Promise.resolve(users));

      const result = await resolver.users();
      expect(result).toEqual(users);
      expect(userService.findAllUsers).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        password: 'password123',
      };
      const newUser = new User();
      newUser.id = '2';
      newUser.email = 'test@example.com';

      mockUserService.create.mockReturnValue(Promise.resolve(newUser));

      const result = await resolver.createUser(createUserInput);
      expect(result).toEqual(newUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserInput);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const userId = '1';
      const user = new User();
      user.id = userId;

      mockUserService.findById.mockReturnValue(Promise.resolve(user));
      mockUserService.delete.mockReturnValue(Promise.resolve(user));

      const result = await resolver.deleteUser(userId, user);
      expect(result).toEqual(user);
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = '1';
      mockUserService.findById.mockReturnValue(Promise.resolve(null));

      await expect(resolver.deleteUser(userId, null)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if trying to delete another user', async () => {
      const userId = '1';
      const currentUser = new User();
      currentUser.id = '2'; // Different user ID

      mockUserService.findById.mockReturnValue(Promise.resolve(new User()));

      await expect(resolver.deleteUser(userId, currentUser)).rejects.toThrow(ForbiddenException);
    });
  });
});