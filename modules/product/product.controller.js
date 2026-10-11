const Products = require("../../models/product.model");
const bcrypt = require("bcrypt")  

//
module.exports = {
  getProducts: async (req, res, next) => {
    try {
      const products = await Products.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      next(error);
    }

  },
  getById: async (req, res, next) => {
    try {
      const productId = Number(req.params.id || req.body.product_id);
      if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).json({ message: "Product id must be a positive integer" });
      }
      const products = await Products.findByPk(productId)//findOne({ where: { id: productId } });
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      next(error);
    }

  },
  createProduct: async (req, res, next) => {
    try {
      const { product_name, price } = req.body; 
      const existingProduct = await Products.findOne({ where: { product_name: product_name } });
      if (existingProduct) {
        return res.status(400).json({ message: "Product already exists" });
      }  
      const product = await Products.create({ product_name, price });
      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  updateProduct: async (req, res, next) => {
    try {
      const productId = Number(req.params.id || req.body.product_id);
      const { product_name, price } = req.body;
      if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).json({ message: "Product id must be a positive integer" });
      }
      const product = await Products.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product_name !== undefined) product.product_name = product_name;
      if (price !== undefined) product.price = price;
      await product.save();
      res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
      console.error(error);
      next(error);
    } 
  },
  deleteProduct: async (req, res, next) => {
    try {
      const productId = Number(req.params.id || req.body.product_id);
      if (!Number.isInteger(productId) || productId < 1) {
        return res.status(400).json({ message: "Product id must be a positive integer" });
      }
      const product = await Products.findByPk(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });  
      }
      await product.destroy();
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};