import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    // Check if parent exists if provided
    if (createCategoryInput.parentId) {
      const parent = await this.findById(createCategoryInput.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = new this.categoryModel({
      ...createCategoryInput,
      parent: createCategoryInput.parentId,
    });

    return this.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find({ isActive: true })
      .populate('parent')
      .sort('order')
      .exec();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel
      .findById(id)
      .populate('parent')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryModel
      .findOne({ slug, isActive: true })
      .populate('parent')
      .exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput): Promise<Category> {
    const category = await this.findById(id);

    // Prevent circular reference
    if (updateCategoryInput.parentId && updateCategoryInput.parentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    // Check if new parent exists
    if (updateCategoryInput.parentId) {
      const parent = await this.findById(updateCategoryInput.parentId);
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      category.parent = parent;
    }

    Object.assign(category, updateCategoryInput);
    return this.save(category);
  }

  async delete(id: string): Promise<Category> {
    // Check if category has children
    const hasChildren = await this.categoryModel.exists({ parent: id });
    if (hasChildren) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    const category = await this.findById(id);
    await category.remove();
    return category;
  }

  async getSubcategories(parentId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ parent: parentId, isActive: true })
      .sort('order')
      .exec();
  }

  async getRootCategories(): Promise<Category[]> {
    return this.categoryModel
      .find({ parent: null, isActive: true })
      .sort('order')
      .exec();
  }

  async reorderCategories(categoryIds: string[]): Promise<Category[]> {
    const updates = categoryIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await this.categoryModel.bulkWrite(updates);
    return this.findAll();
  }

  async getCategoryPath(id: string): Promise<Category[]> {
    const path: Category[] = [];
    let current = await this.findById(id);

    while (current) {
      path.unshift(current);
      if (current.parent) {
        current = await this.findById(current.parent.toString());
      } else {
        current = null;
      }
    }

    return path;
  }

  async save(category: Category): Promise<Category> {
    return category.save();
  }
}