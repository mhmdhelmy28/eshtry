const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app.js");
const { sequelize, initDatabase } = require("../src/models/index.js");
const User = require("../src/models/user.js");
const Review = require("../src/models/review.js");
const { execSync } = require('child_process');

const Product = require("../src/models/product.js");
const Category = require("../src/models/category.js");

chai.use(chaiHttp);
const expect = chai.expect;

// Set up test data
const review_data = {
    content: "This is a great product!",
};

describe("POST /products/:productId/reviews", () => {
    let user;
    let user2;
    let token;
    let category;
    let product;
    let token2;
    before(async () => {
        // connect to database
        await initDatabase();
        try {
            execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
                 category = await Category.create({ name: "Test Category" });
        // Create a user
        user = await User.create({
            firstName: "Test",
            lastName: "User",
            username: "testuser",
            password: "PassworD@123",
        });

        user2 = await User.create({
            firstName: "Test",
            lastName: "User2",
            username: "testuser2",
            password: "PassworD@123",
        });
        // Log in the user and get a JWT token
        const response = await chai
            .request(app)
            .post("/signIn")
            .send({ username: user.username, password: "PassworD@123" });
        token = response.body.accessToken;
        console.log(token);
        const response2 = await chai
            .request(app)
            .post("/signIn")
            .send({ username: user2.username, password: "PassworD@123" });
        token2 = response2.body.accessToken;

        // Create a category
        category = await Category.create({
            name: "Test Category",
            description: "Test",
        });

        // Create a product with the category
        product = await Product.create({
            name: "Test Product",
            description: "This is a test product",
            price: 10,
            CategoryId: category.id,
        });
    }catch(err){
        console.log(err);
        process.exit(0);
    }
    });

    it("should create a review with valid JWT token", (done) => {
        chai.request(app)
            .post(`/products/${product.id}/reviews`)
            .set("Authorization", `Bearer ${token}`)
            .send(review_data)
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property("ProductId").eql(product.id);
                expect(res.body).to.have.property("content").eql(review_data.content);
                review_data.id = res.body.id;
                done();
            });
    });

    it("should not create a review without a valid JWT token", (done) => {
        chai.request(app)
            .post(`/products/${product.id}/reviews`)
            .send(review_data)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body).to.have.property("message").eql("user not authorized");
                done();
            });
    });
     it("should return a 403 status with a non-valid JWT", (done) => {
        chai.request(app)
            .delete(`/products/${product.id}/reviews/ ${review_data.id}`)
            .set("Authorization", `Bearer ${token2}`)
            .end((err, res) => {
                expect(res).to.have.status(403);
                expect(res.body).to.have.property("message").eql("user not authorized");
                done();
            });
    });
    
    it("should delete a review with a valid JWT", (done) => {
        
        chai.request(app)
            .delete(`/products/${product.id}/reviews/ ${review_data.id}`)
            .set("Authorization", `Bearer ${token}`)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("message").eql("Review deleted successfully");
                done();
            });
    });
   
    
after(async () => {
    // Remove the test data
    await Review.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
   // await sequelize.close();
});
});
