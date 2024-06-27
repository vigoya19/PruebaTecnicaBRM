const { Op } = require('sequelize');

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  getAdminPurchases,
} = require('../controller');
const User = require('../../user/model');
const Purchase = require('../model');
const Product = require('../../product/model');
const PurchaseProduct = require('../../purchaseProduct/model');
const sequelize = require('../../config/database');
const { SUCCESS } = require('../../constants/httpCodes');
const logger = require('../../utils/logger');

const {
  InternalServerError,
  ConflictError,
  NotFound,
  BadRequest,
} = require('../../utils/customErrors');

jest.mock('../../utils/logger');

describe('Purchase Controller', () => {
  describe('createPurchase', () => {
    it('should create a new purchase', async () => {
      const req = {
        user: { id: 1 },
        body: {
          products: [{ productId: 1, quantity: 2 }],
          purchaseDate: '2024-06-27T00:00:00.000Z',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const transaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);

      const findProductSpy = jest.spyOn(Product, 'findByPk').mockResolvedValue({
        id: 1,
        price: 100,
        availableQuantity: 10,
        save: jest.fn().mockResolvedValue(true),
      });
      const createPurchaseSpy = jest
        .spyOn(Purchase, 'create')
        .mockResolvedValue({ id: 1 });
      const bulkCreateSpy = jest
        .spyOn(PurchaseProduct, 'bulkCreate')
        .mockResolvedValue(true);

      await createPurchase(req, res, next);

      expect(findProductSpy).toHaveBeenCalledWith(1);
      expect(createPurchaseSpy).toHaveBeenCalledWith(
        {
          userId: 1,
          purchaseDate: '2024-06-27T00:00:00.000Z',
          totalAmount: 200,
        },
        { transaction },
      );
      expect(bulkCreateSpy).toHaveBeenCalledWith(
        [
          {
            purchaseId: 1,
            productId: 1,
            quantity: 2,
          },
        ],
        { transaction },
      );
      expect(transaction.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(SUCCESS.OK.status);
      expect(res.json).toHaveBeenCalledWith({ id: 1 });

      findProductSpy.mockRestore();
      createPurchaseSpy.mockRestore();
      bulkCreateSpy.mockRestore();
    });

    it('should handle errors', async () => {
      const req = {
        user: { id: 1 },
        body: {
          products: [{ productId: 1, quantity: 2 }],
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const transaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      jest.spyOn(sequelize, 'transaction').mockResolvedValue(transaction);

      jest.spyOn(Product, 'findByPk').mockRejectedValue(new Error('Error'));

      await createPurchase(req, res, next);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));
    });
  });

  describe('getPurchases', () => {
    it('should return user purchases', async () => {
      const req = {
        user: { id: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const purchases = [
        {
          id: 1,
          purchaseDate: '2024-06-27T00:00:00.000Z',
          totalAmount: 200,
          products: [
            {
              id: 1,
              name: 'Product 1',
              price: 100,
              PurchaseProduct: {
                quantity: 2,
              },
            },
          ],
        },
      ];

      jest.spyOn(Purchase, 'findAll').mockResolvedValue(purchases);

      await getPurchases(req, res, next);

      expect(Purchase.findAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity'] },
          },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(SUCCESS.OK.status);
      expect(res.json).toHaveBeenCalledWith([
        {
          id: 1,
          purchaseDate: '2024-06-27T00:00:00.000Z',
          totalAmount: 200,
          products: [
            {
              id: 1,
              name: 'Product 1',
              price: 100,
              quantity: 2,
            },
          ],
        },
      ]);
    });
  });

  describe('getPurchaseById', () => {
    it('should return purchase by id', async () => {
      const req = {
        params: { id: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const purchase = {
        id: 1,
        purchaseDate: '2024-06-27T00:00:00.000Z',
        totalAmount: 200,
        user: {
          id: 1,
          username: 'testuser',
        },
        products: [
          {
            id: 1,
            name: 'Product 1',
            price: 100,
            PurchaseProduct: {
              quantity: 2,
            },
          },
        ],
      };

      jest.spyOn(Purchase, 'findByPk').mockResolvedValue(purchase);

      await getPurchaseById(req, res, next);

      expect(Purchase.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity'] },
          },
          { model: User, as: 'user', attributes: ['username'] },
        ],
      });
      expect(res.status).toHaveBeenCalledWith(SUCCESS.OK.status);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        purchaseDate: '2024-06-27T00:00:00.000Z',
        totalAmount: 200,
        user: {
          id: 1,
          username: 'testuser',
        },
        products: [
          {
            id: 1,
            name: 'Product 1',
            price: 100,
            quantity: 2,
          },
        ],
      });
    });

    it('should handle purchase not found', async () => {
      const req = {
        params: { id: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jest.spyOn(Purchase, 'findByPk').mockResolvedValue(null);

      await getPurchaseById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFound));
    });

    it('should handle errors', async () => {
      const req = {
        params: { id: 1 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jest.spyOn(Purchase, 'findByPk').mockRejectedValue(new Error('Error'));

      await getPurchaseById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));
    });
  });

  describe('getAdminPurchases', () => {
    it('should return all purchases for admin with pagination', async () => {
      const req = {
        query: {
          userId: 1,
          productId: 1,
          username: 'testuser',
          productName: 'Product 1',
          page: 1,
          limit: 10,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const purchases = {
        count: 1,
        rows: [
          {
            id: 1,
            purchaseDate: '2024-06-27T00:00:00.000Z',
            totalAmount: 200,
            user: {
              id: 1,
              username: 'testuser',
            },
            products: [
              {
                id: 1,
                name: 'Product 1',
                price: 100,
                PurchaseProduct: {
                  quantity: 2,
                },
              },
            ],
          },
        ],
      };

      jest.spyOn(Purchase, 'findAndCountAll').mockResolvedValue(purchases);

      await getAdminPurchases(req, res, next);

      expect(Purchase.findAndCountAll).toHaveBeenCalledWith({
        where: req.query.userId ? { userId: req.query.userId } : {},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username'],
            where: req.query.username
              ? { username: { [Op.like]: `%${req.query.username}%` } }
              : {},
          },
          {
            model: Product,
            as: 'products',
            through: { attributes: ['quantity'] },
            where: req.query.productId ? { id: req.query.productId } : {},
          },
        ],
        limit: parseInt(req.query.limit, 10),
        offset:
          (parseInt(req.query.page, 10) - 1) * parseInt(req.query.limit, 10),
      });

      expect(res.status).toHaveBeenCalledWith(SUCCESS.OK.status);
      expect(res.json).toHaveBeenCalledWith({
        totalPages: 1,
        currentPage: 1,
        totalPurchases: 1,
        purchases: purchases.rows.map((purchase) => ({
          id: purchase.id,
          purchaseDate: purchase.purchaseDate,
          totalAmount: purchase.totalAmount,
          user: {
            id: purchase.user.id,
            username: purchase.user.username,
          },
          products: purchase.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.PurchaseProduct.quantity,
          })),
        })),
      });
    });

    it('should handle errors', async () => {
      const req = {
        query: {
          page: 1,
          limit: 10,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      jest
        .spyOn(Purchase, 'findAndCountAll')
        .mockRejectedValue(new Error('Error'));

      await getAdminPurchases(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));
    });
  });
});
