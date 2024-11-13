import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Product, ProductDocument } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductFilterInput } from './dto/product-filter.input';
import { PRODUCT_CONSTANTS } from './product.constants';
import { CategoryService } from '../category/category.service';
import { PaginationArgs } from '../../common/dto/pagination.args';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private categoryService: CategoryService,
  ) {}

  async create(createProductInput: CreateProductInput): Promise<Product> {
    // Validate category exists
    const category = await this.categoryService.findById(createProductInput.categoryId);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Validate images count
    if (createProductInput.images?.length > PRODUCT_CONSTANTS.MAX_IMAGES_PER_PRODUCT) {
      throw new BadRequestException(`Maximum ${PRODUCT_CONSTANTS.MAX_IMAGES_PER_PRODUCT} images allowed`);
    }

    // Create product
    const product = new this.productModel({
      ...createProductInput,
      category: category._id,
    });

    return this.save(product);
  }

  async findAll(
    filter: ProductFilterInput = {},
    pagination: PaginationArgs = { page: 1, limit: 10 }
  ): Promise<{ items: Product[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build filter query
    const query: any = { isActive: true };

    if (filter.categoryId) {
      query.category = filter.categoryId;
    }

    if (filter.search) {
      query.$text = { $search: filter.search };
    }

    if (filter.minPrice || filter.maxPrice) {
      query.price = {};
      if (filter.minPrice) query.price.$gte = filter.minPrice;
      if (filter.maxPrice) query.price.$lte = filter.maxPrice;
    }

    if (filter.inStock) {
      query.stockQuantity = { $gt: 0 };
    }

    // Execute query
    const [items, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('category')
        .sort(filter.sortBy || '-createdAt')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(query),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ slug, isActive: true })
      .populate('category')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductInput: UpdateProductInput): Promise<Product> {
    const product = await this.findById(id);

    // Validate category if changing
    if (updateProductInput.categoryId) {
      const category = await this.categoryService.findById(updateProductInput.categoryId);
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      product.category = category;
      delete updateProductInput.categoryId;
    }

    // Update and return
    Object.assign(product, updateProductInput);
    return this.save(product);
  }

  async remove(id: string): Promise<Product> {
    const product = await this.findById(id);
    await this.productModel.deleteOne({ _id: id });
    return product;
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findById(id);
    product.stockQuantity = Math.max(0, product.stockQuantity + quantity);
    return this.save(product);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.productModel.updateOne(
      { _id: id },
      { $inc: { viewCount: 1 } }
    );
  }

  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    return this.productModel
      .find({ isActive: true, isFeatured: true })
      .populate('category')
      .limit(limit)
      .sort('-createdAt')
      .exec();
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const product = await this.findById(productId);

    return this.productModel
      .find({
        _id: { $ne: productId },
        category: product.category,
        isActive: true,
      })
      .populate('category')
      .limit(limit)
      .exec();
  }

  async searchProducts(
    query: string,
    pagination: PaginationArgs = { page: 1, limit: 10 }
  ): Promise<{ items: Product[]; total: number }> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          $text: { $search: query },
          isActive: true,
        },
      },
      {
        $addFields: {
          score: { $meta: 'textScore' },
        },
      },
      {
        $sort: {
          score: { $meta: 'textScore' },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
    ];

    const [results, [{ total } = { total: 0 }]] = await Promise.all([
      this.productModel.aggregate(pipeline),
      this.productModel.aggregate([
        { $match: { $text: { $search: query }, isActive: true } },
        { $count: 'total' },
      ]),
    ]);

    return {
      items: results,
      total,
    };
  }

  async updateRating(id: string, rating: number): Promise<Product> {
    const product = await this.findById(id);

    // Initialize reviewCount and rating if they are not set
    if (!product.reviewCount) {
        product.reviewCount = 0;
        product.rating = 0; // Initialize rating to 0 if no reviews exist
    }

    // Update rating and review count
    product.rating = ((product.rating * product.reviewCount) + rating) / (product.reviewCount + 1);
    product.reviewCount += 1;

    return this.save(product);
  }

  async checkStock(id: string, quantity: number): Promise<boolean> {
    const product = await this.findById(id);
    return product.stockQuantity >= quantity;
  }

  async save(product: Product): Promise<Product> {
    return product.save();
  }
}