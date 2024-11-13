import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Category } from '../../category/entities/category.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Product extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field(() => Float)
  @Prop({ required: true, min: 0 })
  price: number;

  @Field(() => Float, { nullable: true })
  @Prop({ min: 0 })
  compareAtPrice?: number;

  @Field(() => Float)
  @Prop({ default: 0 })
  stockQuantity: number;

  @Field(() => Category)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category: Category;

  @Field(() => [String], { nullable: true })
  @Prop({ type: [String], default: [] })
  images: string[];

  @Field(() => Boolean, { defaultValue: false })
  @Prop({ default: false })
  isFeatured: boolean;

  @Field(() => String)
  @Prop({ default: 'ACTIVE' })
  status: string;

  @Field(() => Float, { defaultValue: 0 })
  @Prop({ default: 0 })
  rating: number;

  @Field(() => Float, { defaultValue: 0 })
  @Prop({ default: 0 })
  reviewCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ name: 1 });
ProductSchema.index({ category: 1 });