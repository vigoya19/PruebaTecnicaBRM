const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require('../controller');
const Product = require('../model');
const { SUCCESS } = require('../../constants/httpCodes');
const logger = require('../../utils/logger');
const { InternalServerError } = require('../../utils/customErrors');

describe('Product Controller', () => {
  describe('createProduct', () => {
    it('should create a new product', async () => {
      const req = {
        body: {
          lotNumber: '12345',
          name: 'Product 1',
          price: 100,
          availableQuantity: 50,
          entryDate: new Date(),
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const createdProduct = {
        id: 1,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createProductSpy = jest
        .spyOn(Product, 'create')
        .mockResolvedValue(createdProduct);

      await createProduct(req, res, next);

      expect(createProductSpy).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(SUCCESS.CREATED.status);
      expect(res.json).toHaveBeenCalledWith(createdProduct);

      createProductSpy.mockRestore();
    });

    it('should handle errors', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const createProductSpy = jest
        .spyOn(Product, 'create')
        .mockRejectedValue(new Error('Failed to create product'));

      await createProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));

      createProductSpy.mockRestore();
    });
  });

  describe('getProducts', () => {
    it('should return all products', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const products = [
        {
          id: 1,
          lotNumber: '12345',
          name: 'Product 1',
          price: 100,
          availableQuantity: 50,
          entryDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const getProductsSpy = jest
        .spyOn(Product, 'findAll')
        .mockResolvedValue(products);

      await getProducts(req, res, next);

      expect(getProductsSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(SUCCESS.OK.status);
      expect(res.json).toHaveBeenCalledWith(products);

      getProductsSpy.mockRestore();
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const getProductsSpy = jest
        .spyOn(Product, 'findAll')
        .mockRejectedValue(new Error('Failed to fetch products'));

      await getProducts(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));

      getProductsSpy.mockRestore();
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const req = {
        params: { id: 1 },
        body: {
          lotNumber: '12345',
          name: 'Product 1 Updated',
          price: 150,
          availableQuantity: 30,
          entryDate: new Date(),
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const updatedProduct = [1]; // Sequelize update method returns an array with the number of affected rows

      const updateProductSpy = jest
        .spyOn(Product, 'update')
        .mockResolvedValue(updatedProduct);

      await updateProduct(req, res, next);

      expect(updateProductSpy).toHaveBeenCalledWith(req.body, {
        where: { id: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(SUCCESS.OK.status);
      expect(res.json).toHaveBeenCalledWith(updatedProduct);

      updateProductSpy.mockRestore();
    });

    it('should handle errors', async () => {
      const req = { params: { id: 1 }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const updateProductSpy = jest
        .spyOn(Product, 'update')
        .mockRejectedValue(new Error('Failed to update product'));

      await updateProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));

      updateProductSpy.mockRestore();
    });
  });
});
