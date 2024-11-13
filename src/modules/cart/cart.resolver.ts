import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { CheckoutInput } from './dto/checkout.input';
import { Order } from '../order/entities/order.entity';
// import { Wishlist } from '../wishlist/entities/wishlist.entity';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ICurrentUser } from 'src/common/interfaces/current-user.interface';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  // Cart Management
  @Query(() => Cart)
  @UseGuards(GqlAuthGuard)
  async getMyCart(@CurrentUser() currentUser: ICurrentUser) {
    return this.cartService.findByUserId(currentUser._id);
  }

  // Cart Items Management
  @Mutation(() => Cart)
  @UseGuards(GqlAuthGuard)
  async addToCart(
    @Args('productId') productId: string,
    @Args('quantity') quantity: number,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.cartService.addItem(currentUser._id, productId, quantity);
  }

  @Mutation(() => Cart)
  @UseGuards(GqlAuthGuard)
  async removeFromCart(
    @Args('productId') productId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.cartService.removeItem(currentUser._id, productId);
  }

  @Mutation(() => Cart)
  @UseGuards(GqlAuthGuard)
  async updateCartItemQuantity(
    @Args('productId') productId: string,
    @Args('quantity') quantity: number,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.cartService.updateItemQuantity(currentUser._id, productId, quantity);
  }

  @Mutation(() => Cart)
  @UseGuards(GqlAuthGuard)
  async clearCart(@CurrentUser() currentUser: ICurrentUser) {
    return this.cartService.clear(currentUser._id);
  }

  // Checkout Process
  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async checkout(
    @Args('input') checkoutInput: CheckoutInput,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.cartService.checkout(currentUser._id, checkoutInput);
  }

  // Wishlist Management
  // @Mutation(() => Wishlist)
  // @UseGuards(GqlAuthGuard)
  // async addToWishlist(
  //   @Args('productId') productId: string,
  //   @CurrentUser() currentUser: ICurrentUser,
  // ) {
  //   return this.cartService.addToWishlist(currentUser._id, productId);
  // }

  // Save for Later
  @Mutation(() => Cart)
  @UseGuards(GqlAuthGuard)
  async saveForLater(
    @Args('productId') productId: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.cartService.saveForLater(currentUser._id, productId);
  }

  // Apply Coupon/Discount
  @Mutation(() => Cart)
  @UseGuards(GqlAuthGuard)
  async applyCoupon(
    @Args('couponCode') couponCode: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return this.cartService.applyCoupon(currentUser._id, couponCode);
  }
}