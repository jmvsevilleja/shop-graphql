import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, Max } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}