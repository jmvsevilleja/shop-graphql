import { InputType, Field, Float } from '@nestjs/graphql';
import { IsOptional, IsNumber, Min, IsString, IsBoolean } from 'class-validator';

@InputType()
export class ProductFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;
}