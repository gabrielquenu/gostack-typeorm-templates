import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
// import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError('Cliente inválido.');
    }

    const productsExist: any = [];

    products.forEach(async product => {
      const productExists = await this.productsRepository.findAllById([
        { id: product.id },
      ]);

      if (!productExists) {
        throw new AppError('Algum produto é inválido.');
      }

      productsExist.push({
        product_id: productExists[0].id,
        price: productExists[0].price,
        quantity: productExists[0].quantity,
      });
    });

    const order = this.ordersRepository.create({
      customer: customerExists,
      products: productsExist,
    });

    return order;
  }
}

export default CreateOrderService;
