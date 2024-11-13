import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, Min, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class ProductImageInput {
  @Field()
  @IsNotEmpty()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  alt?: string;

  @Field({ defaultValue: false })
  isMain: boolean;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field()
  @IsNotEmpty()
  categoryId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [ProductImageInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageInput)
  images?: ProductImageInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;
}