import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Query(() => Category)
  async category(@Args('id', { type: () => ID }) id: string): Promise<Category> {
    return this.categoryService.findById(id);
  }

  @Query(() => Category)
  async categoryBySlug(@Args('slug') slug: string): Promise<Category> {
    return this.categoryService.findBySlug(slug);
  }

  @Query(() => [Category])
  async rootCategories(): Promise<Category[]> {
    return this.categoryService.getRootCategories();
  }

  @Query(() => [Category])
  async subcategories(
    @Args('parentId', { type: () => ID }) parentId: string,
  ): Promise<Category[]> {
    return this.categoryService.getSubcategories(parentId);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async createCategory(
    @Args('input') createCategoryInput: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryInput);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryInput);
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Category> {
    return this.categoryService.remove(id);
  }

  @Mutation(() => [Category])
  @UseGuards(GqlAuthGuard)
  async reorderCategories(
    @Args('categoryIds', { type: () => [ID] }) categoryIds: string[],
  ): Promise<Category[]> {
    return this.categoryService.reorderCategories(categoryIds);
  }
}