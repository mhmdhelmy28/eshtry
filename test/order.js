const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const  Category  = require('../src/models/category.js');
const  Order  = require('../src/models/order.js');
const User = require('../src/models/user.js');
const Address = require('../src/models/address.js');
const { execSync } = require('child_process');

const  OrderItem  = require('../src/models/order-item.js');
const { sequelize, initDatabase } = require("../src/models/index.js");
const Product = require('../src/models/product');
chai.use(chaiHttp);
const expect = chai.expect;




describe("Order API", () => {
  let userToken;
  let responseUser;
   let category;
   let product1;
   let product2;
   let order;
   let user;
   let address;
   let traderId;
   const username = "JoeDoe";
   const password = "PassworD@123";
  before(async () => {
    await initDatabase();
    try {
      execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
           category = await Category.create({ name: "Test Category" });
     category = await Category.create({ name: "Test Category" });
     const trader = await chai
        .request(app)
        .post("/signUp")
        .send({ 
            firstName: "Test",
            lastName: "Trader",
            username: username,
            password: password,
            role: "trader",
            storeName: "sa"
        });
        const traderResponse = await chai
            .request(app)
            .post("/signIn")
            .send({ username: username, password: password });
        traderToken = traderResponse.body.accessToken;
        traderId = trader.body.trader.id;
     product1 = await Product.create({
      name: "Product 1",
      description: "Product1 Description",
      price: 10,
      CategoryId: category.id,
      TraderId: traderId,
    });
    product2 = await Product.create({
      name: "Product 2",
      description: "Product2 Description",
      price: 20,
      CategoryId: category.id,
      TraderId: traderId,
    });
       user = await chai
      .request(app)
      .post("/signUp")
      .send({ 
          firstName: "Test",
          lastName: "User",
          username: "testuser",
          password: "PassworD@123",
          role: "user",
      });
    address = await Address.create({city: "aga", street: "sw", UserId: user.body.user.id});
    responseUser = await chai
      .request(app)
      .post("/signIn")
      .send({ username: "testuser", password:  "PassworD@123"});
    userToken = responseUser.body.accessToken;
    }catch(err){
      console.log(err);
      process.exit(0);
    }
});

  
    describe("POST /order", () => {
      it("returns 201 and order items when a valid order is created", async () => {
  
        const response = await chai
          .request(app)
          .post("/order")
          .set("Authorization", `Bearer ${userToken}`)
          .send({
            addressId: address.id,
            cartItems: [{ id: product1.id, quantity: 2 }],
          });
          
        expect(response).to.have.status(201);
        expect(response.body).to.have.length(1);
        expect(response.body[0]).to.have.property("quantity").eql(2);
        expect(response.body[0]).to.have.property("price").eql(20);
        expect(response.body[0]).to.have.property("ProductId").eql(product1.id);
        
        //Check that the order was created in the database
         order = await Order.findByPk(response.body[0].OrderId, { include: OrderItem });
        expect(order.totalPrice).to.equal(20);
        expect(order.OrderItems.length).to.equal(1);
        expect(order.OrderItems[0].quantity).to.equal(2);
        expect(order.OrderItems[0].price).to.equal(20);
        expect(order.OrderItems[0].ProductId).to.equal(product1.id);

      });
      // it("should create an order with multiple cart items", async () => {
      
      //   // create cart items
      //   const cartItems = [    { id: product1.id, quantity: 2 },    { id: product2.id, quantity: 1 },  ];
      
      //   // create order
      //   const response = await chai 
      //      .request(app)
      //     .post("/order")
      //     .send({ addressId: 1, cartItems })
      //     .set("Authorization", `Bearer ${userToken}`);
      
      //   // assert response
      //   expect(response.status).to.equal(201);
      
      //   // assert order items
      //   const orderItems = response.body;
      //   expect(orderItems.length).to.equal(2);
      //   expect(orderItems[0].quantity).to.equal(2);
      //   expect(orderItems[0].price).to.equal(10);
      //   expect(orderItems[0].ProductId).to.equal(product1.id);
      //   expect(orderItems[1].quantity).to.equal(1);
      //   expect(orderItems[1].price).to.equal(20);
      //   expect(orderItems[1].ProductId).to.equal(product2.id);
      
      //   // assert order
      //   const order = await Order.findByPk(orderItems[0].OrderId, { include: OrderItem });
      //   expect(order).to.have.property("id");
      //   expect(order.UserId).to.equal(2);
      //   expect(order.AddressId).to.equal(1);
      //   expect(order.totalPrice).to.equal(40);
      //   expect(order.OrderItems.length).to.equal(2);
      //   expect(order.OrderItems[0]).to.have.property("id");
      //   expect(order.OrderItems[0]).to.have.property("quantity").that.equals(2);
      //   expect(order.OrderItems[0]).to.have.property("price").that.equals(10);
      //   expect(order.OrderItems[0]).to.have.property("ProductId").that.equals(product1.id);
      //   expect(order.OrderItems[1]).to.have.property("id");
      //   expect(order.OrderItems[1]).to.have.property("quantity").that.equals(1);
      //   expect(order.OrderItems[1]).to.have.property("price").that.equals(20);
      //   expect(order.OrderItems[1]).to.have.property("ProductId").that.equals(product2.id);
      // });  

      it('should return an error if address ID is missing', async () => {
        const cartItems = [      { id: product1.id, quantity: 2 },    ];
        const requestBody = {
          cartItems: cartItems,
        };
        const response = await chai
          .request(app)
          .post('/order')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestBody);
        expect(response.status).to.equal(400);
        expect(response.body.message).to.equal("Address and cartItems are both required.");
      });
      it('should return an error if cart items are missing', async () => {
        const requestBody = {
          addressId: address.id,
        };
        const response = await chai 
          .request(app)
          .post('/order')
          .set('Authorization', `Bearer ${userToken}`)
          .send(requestBody);
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal("Address and cartItems are both required.");
      });
      it("should return an error if cart item ID is invalid", async () => {
        const response = await chai
         .request(app)
          .post("/order")
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            addressId: address.id,
            cartItems: [{ id: 10, quantity: 2 }], // Invalid product ID
          })
          expect(response.status).to.equal(400);
        expect(response.body.message).to.equal("Some cartItems ids are invalid");
      });
      it("should return an error if cart is empty", async () => {
  
        const response = await chai 
          .request(app)
          .post("/order")
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            addressId: 1,
           cartItems: []
          });
          expect(response.status).to.equal(400);
          expect(response.body.message).to.equal("Address and cartItems are both required.");
    });
  });
  describe("GET /order/:id", () => {
    it("should return the order with the given id", async () => {
      const response = await chai.request(app)
      .get(`/order/${order.id}`)
      .set('Authorization', `Bearer ${userToken}`);
    
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("id").equal(order.id);
      expect(response.body).to.have.property("UserId").equal(order.UserId);
      expect(response.body).to.have.property("AddressId").equal(order.AddressId);
      expect(response.body).to.have.property("totalPrice").equal(order.totalPrice);
    });
  
    it("should return a 404 error if the order with the given id does not exist", async () => {
      const response = await chai.request(app)
      .get(`/order/999`)
      .set('Authorization', `Bearer ${userToken}`);
  
      expect(response.status).to.equal(404);
      expect(response.body).to.have.property("message").equal("Order not found");
    });
  });

  describe("GET /order/", () => {
  it("should return all orders for the given user id", async () => {
    

    const response = await chai.request(app).get(`/order/`).set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(200);
    expect(response.body).to.be.an('array').and.to.have.lengthOf(1);
    expect(response.body[0]).to.have.property('id').equal(order.id);
    expect(response.body[0]).to.have.property('UserId').equal(order.UserId);
    expect(response.body[0]).to.have.property('AddressId').equal(order.AddressId);
    expect(response.body[0]).to.have.property('totalPrice').equal(order.totalPrice);
  });
  it("should return order by id", async () => {
    

    const response = await chai.request(app).get(`/order/${order.id}`).set('Authorization', `Bearer ${userToken}`);
    expect(response).to.have.status(200);
    expect(response.body).to.have.property('id').equal(order.id);
    expect(response.body).to.have.property('UserId').equal(order.UserId);
    expect(response.body).to.have.property('AddressId').equal(order.AddressId);
    expect(response.body).to.have.property('totalPrice').equal(order.totalPrice);
  });
});

    after(async () => {
        // Remove the test data
        await Product.destroy({ where: {} });
        await Category.destroy({ where: {} });
        await User.destroy({ where: {} });
        await Order.destroy({ where: {} });
        await OrderItem.destroy({ where: {} });
        await User.destroy({ where: {} });
       // await sequelize.close();
    });
});