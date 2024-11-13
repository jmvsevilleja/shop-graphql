import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';
import { CartService } from '../cart/cart.service';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
  ) {}

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async createOrder(
    @Args('input') createOrderInput: CreateOrderInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<Order> {
    const cart = await this.cartService.findByUserId(currentUser._id);
    return this.orderService.create(
      currentUser._id,
      cart.items,
      cart.total,
      createOrderInput.shippingAddress,
      createOrderInput.billingAddress,
      createOrderInput.paymentMethod,
      createOrderInput.notes,
    );
  }

  @Query(() => Order)
  @UseGuards(GqlAuthGuard)
  async order(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    return this.orderService.findById(id);
  }

  @Query(() => [Order])
  @UseGuards(GqlAuthGuard)
  async myOrders(@CurrentUser() currentUser: ICurrentUser): Promise<Order[]> {
    return this.orderService.findByUserId(currentUser._id);
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async updateOrderStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('status') status: string,
  ): Promise<Order> {
    return this.orderService.updateStatus(id, status);
  }
}