import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IProductsOrder {
  product_id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IOrdersProducts {
  id: string;
  order: Order;
  product: Product;
  product_id: string;
  order_id: string;
  price: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
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
    if (!customer_id) {
      throw new AppError('ID do cliente está vazia.');
    }

    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists || null || undefined) {
      throw new AppError('Cliente inválido.');
    }

    const productsExist = await this.productsRepository.findAllById(products);

    if (products.length !== productsExist.length) {
      throw new AppError('Um ou mais produtos não existem.');
    }

    const orderProducts: IProductsOrder[] = [];

    for (let i = 0; i < productsExist.length; i += 1) {
      orderProducts.push({
        product_id: productsExist[i].id,
        price: productsExist[i].price,
        quantity: products[i].quantity,
      });
    }

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: orderProducts,
    });

    const orderProductsFinal: IOrdersProducts[] = [];

    for (let i = 0; i < productsExist.length; i += 1) {
      orderProductsFinal.push({
        id: productsExist[i].id,
        order,
        product: productsExist[i],
        product_id: productsExist[i].id,
        order_id: order.id,
        price: productsExist[i].price,
        quantity: products[i].quantity,
        created_at: productsExist[i].created_at,
        updated_at: productsExist[i].updated_at,
      });
    }

    return {
      id: order.id,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer: customerExists,
      order_products: orderProductsFinal,
    };
  }
}

export default CreateOrderService;
