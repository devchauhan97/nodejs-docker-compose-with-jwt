const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Products = sequelize.define(
  "products",
  {
    product_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "products",
    timestamps: false,
  }
);

module.exports = Products;