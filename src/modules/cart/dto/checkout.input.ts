import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

@InputType()
export class CheckoutInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  shippingAddress: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  billingAddress: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}