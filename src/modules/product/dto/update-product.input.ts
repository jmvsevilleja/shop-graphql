import { InputType, Field, Float, Int, PartialType, OmitType } from '@nestjs/graphql';
import { CreateProductInput } from './create-product.input';
import { IsOptional, IsNumber, Min, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class UpdateProductImageInput {
  @Field()
  @IsString()
  url: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  alt?: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  isMain: boolean;
}

@InputType()
class UpdateProductVariantInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  options: string[];
}

@InputType()
class UpdateProductSpecificationInput {
  @Field()
  @IsString()
  key: string;

  @Field()
  @IsString()
  value: string;
}

@InputType()
export class UpdateProductInput extends PartialType(
  OmitType(CreateProductInput, ['name'] as const)
) {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => [UpdateProductImageInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductImageInput)
  images?: UpdateProductImageInput[];

  @Field(() => [UpdateProductVariantInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantInput)
  variants?: UpdateProductVariantInput[];

  @Field(() => [UpdateProductSpecificationInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductSpecificationInput)
  specifications?: UpdateProductSpecificationInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brand?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sku?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  barcode?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depth?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}