import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ICurrentUser } from '../interfaces/current-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): ICurrentUser => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request');
    }

    // Ensure the user object matches our interface
    if (!user._id || !user.email || !Array.isArray(user.roles)) {
      throw new UnauthorizedException('Invalid user object in request');
    }

    return user;
  },
);