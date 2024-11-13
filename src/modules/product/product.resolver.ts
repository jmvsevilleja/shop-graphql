import { Resolver, Query, Mutation, Args, ID, Int, Float, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductFilterInput } from './dto/product-filter.input';
import { PaginationArgs } from '../../common/dto/pagination.args';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/interfaces/current-user.interface';
import { ProductsResponse } from './dto/products.response';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  // Queries
  @Query(() => Product)
  async product(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    const product = await this.productService.findById(id);
    // Increment view count asynchronously
    this.productService.incrementViewCount(id).catch(console.error);
    return product;
  }

  @Query(() => Product)
  async productBySlug(
    @Args('slug') slug: string,
  ): Promise<Product> {
    return this.productService.findBySlug(slug);
  }

  @Query(() => ProductsResponse)
  async products(
    @Args('filter', { nullable: true }) filter?: ProductFilterInput,
    @Args() pagination?: PaginationArgs,
  ): Promise<ProductsResponse> {
    const { items, total } = await this.productService.findAll(filter, pagination);
    return { items, total };
  }

  @Query(() => [Product])
  async featuredProducts(
    @Args('limit', { type: () => Int, defaultValue: 8 }) limit: number,
  ): Promise<Product[]> {
    return this.productService.getFeaturedProducts(limit);
  }

  @Query(() => [Product])
  async relatedProducts(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('limit', { type: () => Int, defaultValue: 4 }) limit: number,
  ): Promise<Product[]> {
    return this.productService.getRelatedProducts(productId, limit);
  }

  @Query(() => [Product])
  async searchProducts(
    @Args('query') query: string,
    @Args() pagination?: PaginationArgs,
  ): Promise<{ items: Product[]; total: number }> {
    return this.productService.searchProducts(query, pagination);
  }

  // Admin Mutations
  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createProduct(
    @Args('input') createProductInput: CreateProductInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<Product> {
    return this.productService.create(createProductInput);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateProductInput: UpdateProductInput,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<Product> {
    return this.productService.update(id, updateProductInput);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async deleteProduct(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<Product> {
    return this.productService.remove(id);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async updateProductStock(
    @Args('id', { type: () => ID }) id: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<Product> {
    // TODO: Add admin role check
    return this.productService.updateStock(id, quantity);
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async toggleProductFeature(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<Product> {
    const product = await this.productService.findById(id);
    product.isFeatured = !product.isFeatured;
    return this.productService.save(product);
  }

  // Field Resolvers
  @ResolveField(() => Boolean)
  async inStock(@Parent() product: Product): Promise<boolean> {
    return product.stockQuantity > 0;
  }

  @ResolveField(() => Float, { nullable: true })
  async discountPercentage(@Parent() product: Product): Promise<number | null> {
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      return Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
      );
    }
    return null;
  }
}