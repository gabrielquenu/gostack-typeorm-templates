import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = this.ormRepository.findOne({
      where: { name },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts: Product[] = [];

    products.forEach(async id => {
      const product = await this.ormRepository.findOne({
        where: { id },
      });

      if (product) {
        findProducts.push(product);
      }
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts: Product[] = [];

    products.forEach(async product => {
      const productToUpdate = await this.ormRepository.findOne({
        where: { id: product.id },
      });

      if (productToUpdate) {
        productToUpdate.quantity = product.quantity;

        await this.ormRepository.save(productToUpdate);

        updatedProducts.push(productToUpdate);
      }
    });

    return updatedProducts;
  }
}

export default ProductsRepository;
