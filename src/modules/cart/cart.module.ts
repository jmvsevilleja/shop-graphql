import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartResolver } from './cart.resolver';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './entities/cart.entity';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema }
    ]),
    ProductModule,  // For product validation and info
    UserModule,     // For user operations
    OrderModule,    // For checkout process
  ],
  providers: [
    CartResolver,
    CartService,
  ],
  exports: [CartService],
})
export class CartModule {}