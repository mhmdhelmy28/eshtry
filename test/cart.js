const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const Category = require("../src/models/category.js");
const Order = require("../src/models/order.js");
const User = require("../src/models/user.js");
const { execSync } = require("child_process");

const Cart = require("../src/models/cart.js");
const Address = require("../src/models/address.js");
const OrderItem = require("../src/models/order-item.js");
const CartItem = require("../src/models/cart-item.js");
const { sequelize, initDatabase } = require("../src/models/index.js");
const Product = require("../src/models/product");
chai.use(chaiHttp);
const expect = chai.expect;

describe("Cart API", () => {
  let userToken;
  let responseUser;
  let category;
  let product1;
  let product2;
  let cartItem;
  let address;
  let user;
  before(async () => {
    await initDatabase();
    try {
      execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
      category = await Category.create({ name: "Test Category" });
      await chai.request(app).post("/signUp").send({
        firstName: "Test",
        lastName: "Trader",
        username: "JoeDoe",
        password: "PassworD@123",
        role: "trader",
        storeName: "sa",
      });
      const traderResponse = await chai
        .request(app)
        .post("/signIn")
        .send({ username: "JoeDoe", password: "PassworD@123" });
      traderToken = traderResponse.body.accessToken;
      product1 = await Product.create({
        name: "Product 1",
        description: "Product1 Description",
        price: 10,
        CategoryId: category.id,
      });
      product2 = await Product.create({
        name: "Product 2",
        description: "Product2 Description",
        price: 20,
        CategoryId: category.id,
      });
      user = await chai.request(app).post("/signUp").send({
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        password: "PassworD@123",
        role: "user",
      });
      user = user.body.user;
      address = await Address.create({ city: "aga", street: "sawra", UserId: user.id });
      responseUser = await chai
        .request(app)
        .post("/signIn")
        .send({ username: "testuser", password: "PassworD@123" });
      userToken = responseUser.body.accessToken;
    } catch (error) {
      console.log(error);
      process.exit(0);
    }
  });

  describe("POST /cart", () => {
    it("should return 400 if cart item is missing required fields", async () => {
      const response = await chai
        .request(app)
        .post("/cart")
        .send({ price: 10, quantity: 1 })
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).to.equal(400);
      expect(response.body.message).to.equal("Please provide all required fields");
    });

    it("should create cart item and return 201 when given valid input", async () => {
      const response = await chai
        .request(app)
        .post("/cart")
        .send({ id: product1.id, quantity: 1 })
        .set("Authorization", `Bearer ${userToken}`);
      cartItem = response.body;
      expect(response.status).to.equal(201);
      expect(response.body.CartId).to.not.be.null;
      expect(response.body.ProductId).to.equal(product1.id);
      expect(response.body.quantity).to.equal(1);
      expect(response.body.price).to.equal(10);
    });
  });
  describe("GET /cart", () => {
    it("should return the cart with status 200 if successful", async () => {
      const response = await chai
        .request(app)
        .get("/cart")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("id");
      expect(response.body).to.have.property("UserId").to.equal(user.id);
      expect(response.body).to.have.property("CartItems");
      expect(response.body.CartItems).to.be.an("array").with.lengthOf(1);
    });
  });
  describe("DELETE /cart/:id", () => {
    it("should return 401 if user is not authenticated", async () => {
      const response = await chai.request(app).delete("/cart/1");
      expect(response.status).to.equal(401);
      expect(response.body.message).to.equal("user not authorized");
    });

    it("should return 404 if item does not exist in cart", async () => {
      const response = await chai
        .request(app)
        .delete(`/cart/555`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.equal(404);
      expect(response.body.message).to.equal("Item not found in cart");
    });

    it("should delete item from cart and return 200 if successful", async () => {
      const response = await chai
        .request(app)
        .delete(`/cart/${cartItem.id}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.equal(200);
      expect(response.body.id).to.equal(cartItem.id);
      expect(response.body.ProductId).to.equal(product1.id);
      expect(response.body.quantity).to.equal(1);
      expect(response.body.price).to.equal(10);
    });
  });
  describe("DELETE /cart", () => {
    let cartId;
    before(async () => {
      const cart = await Cart.findOne({ where: { UserId: user.id } });
      cartId = cart.id;
      await CartItem.create({
        CartId: cartId,
        UserId: user.id,
        ProductId: product1.id,
        quantity: 2,
      });
      await CartItem.create({
        CartId: cartId,
        UserId: user.id,
        ProductId: product2.id,
        quantity: 1,
      });
    });

    it("should delete all cart items and return 200", async () => {
      const res = await chai
        .request(app)
        .delete("/cart")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res).to.have.status(200);
      expect(await CartItem.count({ where: { CartId: cartId } })).to.equal(0);
    });
  });
  describe("POST /cart/order", () => {
    let item1;
    let item2;
    before(async () => {
      const cart = await Cart.findOne({ where: { UserId: user.id } });
      cartId = cart.id;
      item1 = await CartItem.create({
        CartId: cartId,
        UserId: user.id,
        ProductId: product1.id,
        quantity: 2,
        price: product1.price * 2,
      });
      item2 = await CartItem.create({
        CartId: cartId,
        UserId: user.id,
        ProductId: product2.id,
        quantity: 1,
        price: product2.price,
      });

      cartItemId1 = item1.id;
      cartItemId2 = item2.id;
    });
    it("should place an order and delete cart items", async () => {
      const res = await chai
        .request(app)
        .post("/cart/order")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ addressId: address.id });
      expect(res).to.have.status(200);
      expect(res).to.be.json;
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(2);
      expect(res.body[0]).to.have.property("id");
      expect(res.body[0]).to.have.property("OrderId");
      expect(res.body[0]).to.have.property("ProductId");
      expect(res.body[0]).to.have.property("quantity");
      expect(res.body[0]).to.have.property("price");
      expect(res.body[0].quantity).to.equal(item1.quantity);
      expect(res.body[0].price).to.equal(item1.price);
      expect(res.body[1].quantity).to.equal(item2.quantity);
      expect(res.body[1].price).to.equal(item2.price);
      const order = await Order.findByPk(res.body[0].OrderId);
      expect(order).to.not.be.null;

      expect(await CartItem.count({ where: { CartId: cartId } })).to.equal(0);
    });
  });
  after(async () => {
    await User.destroy({ where: {} });
    await Address.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Cart.destroy({ where: {} });
    await CartItem.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Address.destroy({ where: {} });
    await Order.destroy({ where: {} });
    await OrderItem.destroy({ where: {} });
  });
});
