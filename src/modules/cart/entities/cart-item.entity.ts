import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Product } from '../../product/entities/product.entity'; // Adjust the import path as necessary

@ObjectType()
@Schema()
export class CartItem extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => Product)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Field(() => Float)
  @Prop({ required: true })
  price: number;

  @Field(() => Float)
  @Prop({ required: true })
  quantity: number;

  @Field(() => Float)
  @Prop({ required: true })
  subtotal: number; // This can be calculated as price * quantity
}

export type CartItemDocument = CartItem & Document;
export const CartItemSchema = SchemaFactory.createForClass(CartItem);