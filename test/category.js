const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const Category = require("../src/models/category.js");
const User = require("../src/models/user.js");
const { execSync } = require("child_process");
const {  initDatabase } = require("../src/models/index.js");
chai.use(chaiHttp);
const expect = chai.expect;

describe("Category API", () => {
  let adminToken;
  let userToken;
  let responseAdmin;
  let responseUser;

  before(async () => {
    await initDatabase();
    try {
      execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
      await chai.request(app).post("/signUp").send({
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        password: "PassworD@123",
        role: "user",
      });
      responseAdmin = await chai
        .request(app)
        .post("/signIn")
        .send({ username: "admin", password: "PassworD@123" });
      adminToken = responseAdmin.body.accessToken;

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

  describe("POST /categories", () => {
    it("should create a new category", async () => {
      const categoryData = {
        name: "Electronics",
        description: "Electronic devices and gadgets",
      };

      const res = await chai
        .request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(categoryData);

      expect(res).to.have.status(201);
      expect(res.body.name).to.equal(categoryData.name);
      expect(res.body.description).to.equal(categoryData.description);

      const category = await Category.findOne({ where: { name: categoryData.name } });
      expect(category).to.not.be.null;
    });

    it("should fail to create a new category as user", async () => {
      const categoryData = {
        name: "Electronics",
        description: "Electronic devices and gadgets",
      };
      const res = await chai
        .request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send(categoryData);

      expect(res).to.have.status(401);
      // expect(res.body).to.have.property("error").eql("Unauthorized: Only admin users can access this endpoint");
    });

    it("should return an error if name and description are not provided", async () => {
      const categoryData = {};

      const res = await chai
        .request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(categoryData);

      expect(res).to.have.status(400);
      expect(res.body.message).to.equal("Name and description are required.");
    });

    it("should return an error if category already exists", async () => {
      const existingCategory = {
        name: "Clothing",
        description: "Clothing and fashion items",
      };
      await Category.create(existingCategory);

      const categoryData = {
        name: existingCategory.name,
        description: existingCategory.description,
      };

      const res = await chai
        .request(app)
        .post("/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(categoryData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message").eql("Category already exists.");
    });
  });

  describe("GET /categories", () => {
    before(async () => {
      await Category.destroy({ where: {} });
    });
    it("should get all categories", async () => {
      const categories = [
        { name: "Electronics", description: "Electronic devices and gadgets" },
        { name: "Books", description: "Books and literature" },
        { name: "Clothing", description: "Clothing and fashion items" },
      ];
      await Category.bulkCreate(categories);

      const res = await chai.request(app).get("/categories");

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(categories.length);
      expect(res.body[0]).to.include(categories[0]);
      expect(res.body[1]).to.include(categories[1]);
      expect(res.body[2]).to.include(categories[2]);
    });
  });
  after(async () => {
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });
});
