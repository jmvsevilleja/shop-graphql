import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface ICurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[]
  // add other properties you need
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): ICurrentUser => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    // Ensure we always return the expected format
    return {
      id: user._id.toString(), // Convert to string if it's ObjectId
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles
      // map other properties
    };
  },
);