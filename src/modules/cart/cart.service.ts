import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductService } from '../product/product.service';
import { OrderService } from '../order/order.service';
import { CheckoutInput } from './dto/checkout.input';
import { Order } from '../order/entities/order.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productService: ProductService,
    private orderService: OrderService,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      // Create new cart if none exists
      return this.cartModel.create({ user: userId, items: [] });
    }
    return cart;
  }

  async save(cart: Cart): Promise<Cart> {
    return cart.save(); // Save the cart instance
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    // Validate product exists and has enough stock
    const product = await this.productService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const cart = await this.findByUserId(userId);
    const existingItem = cart.items.find(item => item.product._id.toString() === productId);

    if (existingItem) {
      // Update quantity if item exists
      existingItem.quantity += quantity;
      existingItem.subtotal = existingItem.price * existingItem.quantity;
    } else {
      // Add new item as a CartItem instance
      const newItem = new CartItem();
      newItem.product = product;
      newItem.price = product.price;
      newItem.quantity = quantity;
      newItem.subtotal = product.price * quantity;

      cart.items.push(newItem);
    }

    // Recalculate totals
    this.calculateTotals(cart);

    return this.save(cart);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
    this.calculateTotals(cart);
    return this.save(cart); // Use the save method
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    const item = cart.items.find(
      item => item.product._id.toString() === productId
    );

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    // Validate stock
    const product = await this.productService.findById(productId);
    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    item.quantity = quantity;
    this.calculateTotals(cart);
    return this.save(cart);
  }

  async clear(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    cart.items = [];
    cart.savedForLater = [];
    cart.couponCode = null;
    this.calculateTotals(cart);
    return this.save(cart);
  }

  async checkout(userId: string, checkoutInput: CheckoutInput): Promise<Order> {
    const cart = await this.findByUserId(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Create order using the new create method
    const order = await this.orderService.create(
      userId,
      cart.items,
      cart.total,
      checkoutInput.shippingAddress,
      checkoutInput.billingAddress,
      checkoutInput.paymentMethod,
      checkoutInput.notes,
    );

    // Clear cart after successful checkout
    await this.clear(userId);

    return order;
  }

  private calculateTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Apply discount if coupon exists
    if (cart.couponCode) {
      // Implement coupon logic here
      cart.discount = 0; // Placeholder
    }

    cart.total = cart.subtotal - (cart.discount || 0);
  }

  async applyCoupon(userId: string, couponCode: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    // Implement coupon validation logic
    cart.couponCode = couponCode;
    this.calculateTotals(cart);
    return this.save(cart);
  }

  async saveForLater(userId: string, productId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    const itemIndex = cart.items.findIndex(
      item => item.product._id.toString() === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    const [item] = cart.items.splice(itemIndex, 1);
    if (!cart.savedForLater) {
      cart.savedForLater = [];
    }
    cart.savedForLater.push(item);

    this.calculateTotals(cart);
    return this.save(cart);
  }
}