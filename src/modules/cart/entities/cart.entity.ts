import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { CartItem } from './cart-item.entity';

@ObjectType()
@Schema({ timestamps: true })
export class Cart extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => User)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Field(() => [CartItem])
  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @Field(() => [CartItem], { nullable: true })
  @Prop({ type: [CartItem], default: [] })
  savedForLater: CartItem[];

  @Field(() => Float)
  @Prop({ required: true, default: 0, min: 0 })
  subtotal: number;

  @Field(() => Float, { nullable: true })
  @Prop({ min: 0 })
  discount?: number;

  @Field(() => String, { nullable: true })
  @Prop()
  couponCode?: string;

  @Field(() => Float)
  @Prop({ required: true, default: 0, min: 0 })
  total: number;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Field(() => Boolean)
  @Prop({ default: false })
  isCheckedOut: boolean;

  @Field(() => Date, { nullable: true })
  @Prop()
  lastActivityDate?: Date;
}

export type CartDocument = Cart & Document;
export const CartSchema = SchemaFactory.createForClass(Cart);

// Add indexes
CartSchema.index({ user: 1 });
CartSchema.index({ updatedAt: 1 });
CartSchema.index({ couponCode: 1 });

// Add middleware
CartSchema.pre('save', function(next) {
  this.lastActivityDate = new Date();

  // Calculate subtotals for each item
  if (this.items) {
    this.items.forEach(item => {
      item.subtotal = item.price * item.quantity;
    });
  }

  // Calculate cart totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal - (this.discount || 0);

  next();
});

// Add virtual fields if needed
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});