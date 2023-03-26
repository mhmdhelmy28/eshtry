const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app.js");
const { sequelize, initDatabase } = require("../src/models/index.js");
const User = require("../src/models/user.js");
const Category = require("../src/models/category.js");
const Product = require("../src/models/product.js");
const { execSync } = require("child_process");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Products API", () => {
  let category1;
  let userToken;
  let adminToken;
  let productId;
  let traderId;
  const username = "JoeDoe";
  const password = "PassworD@123";
  before(async () => {
    await initDatabase();
    try {
      execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
      category = await Category.create({ name: "Test Category" });
      category1 = await Category.create({ name: "cat 1", description: "cat desc" });
      const trader = await chai.request(app).post("/signUp").send({
        firstName: "Test",
        lastName: "Trader",
        username: username,
        password: password,
        role: "trader",
        storeName: "sa",
      });
      const traderResponse = await chai
        .request(app)
        .post("/signIn")
        .send({ username: username, password: password });
      traderToken = traderResponse.body.accessToken;
      traderId = trader.body.trader.id;
      const adminResponse = await chai
        .request(app)
        .post("/signIn")
        .send({ username: "admin", password: password });
      adminToken = adminResponse.body.accessToken;
    } catch (err) {
      console.log(err);
      process.exit(0);
    }
  });
  describe("POST /product", () => {
    it("should create a product with valid JWT token", async () => {
      const res = await chai
        .request(app)
        .post("/products")
        .set("Authorization", `Bearer ${traderToken}`)
        .send({ name: "prod", description: "prod desc", price: 200, categoryId: category1.id });
      productId = res.body.id;
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("name").eql("prod");
    });
    it("should get a 401 a product with non valid JWT token", async () => {
      const res = await chai
        .request(app)
        .post("/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "prod", description: "prod desc", price: 200, categoryId: category1.id });
      expect(res).to.have.status(401);
      expect(res.body)
        .to.have.property("error")
        .eql("Unauthorized: Only traders can access this endpoint");
    });
    it("should return 400 when name is not provided", (done) => {
      chai
        .request(app)
        .post("/products")
        .set("Authorization", `Bearer ${traderToken}`)
        .send({
          description: "Test product description",
          price: 20,
          categoryId: 1,
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message").eql("Please provide all required fields.");
          done();
        });
    });

    it("should return 404 when category is not found", (done) => {
      chai
        .request(app)
        .post("/products")
        .set("Authorization", `Bearer ${traderToken}`)
        .send({
          name: "Test Product",
          description: "Test product description",
          price: 20,
          categoryId: 100,
        })
        .end((err, res) => {
          console.log(res.body.message);
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("message").eql("Category not found.");
          done();
        });
    });
  });
  describe("GET /products", () => {
    describe("GET /products/:id", () => {
      it("should return 200 and the product when product exists", (done) => {
        chai
          .request(app)
          .get(`/products/${productId}`)
          .set("Authorization", `Bearer ${userToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body).to.have.property("id").eql(productId);
            expect(res.body).to.have.property("name");
            expect(res.body).to.have.property("description");
            expect(res.body).to.have.property("price");
            expect(res.body).to.have.property("CategoryId");
            expect(res.body).to.have.property("Reviews").that.is.an("array");
            expect(res.body).to.have.property("Trader");
            expect(res.body.Trader).to.have.property("id", traderId);
            done();
          });
      });
      it("should return 404 when product does not exist", (done) => {
        chai
          .request(app)
          .get("/products/99999")
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.have.property("message").equal("Product not found.");
            done();
          });
      });
      it("should return an array of products", (done) => {
        chai
          .request(app)
          .get("/products")
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("array");
            expect(res.body.length).to.be.equal(1);
            done();
          });
      });
    });
  });
  after(async () => {
    // Remove the test data
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });
});
