import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(
    userId: string,
    items: any[],
    total: number,
    shippingAddress: string,
    billingAddress: string,
    paymentMethod: string,
    notes?: string
  ): Promise<Order> {
    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const order = new this.orderModel({
      user: userId,
      items,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
    });

    return this.save(order);
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('user').exec();
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orderModel.find({ user: userId }).populate('user').exec();
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.findById(id);
    order.status = status;
    return this.save(order);
  }

  async save(order: Order): Promise<Order> {
    return order.save();
  }
}