const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app.js");
const User = require("../src/models/user");
const { execSync } = require('child_process');
const { sequelize, initDatabase } = require("../src/models/index");

chai.use(chaiHttp);
const expect = chai.expect;


describe("User Registration and Login", () => {
  before(async () => {
    await initDatabase();
    try {
      execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    }catch(err){
      console.log(err);
      process.exit(0);
    }
  });


  it("should register a new user", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "PassworD@123",
        role: "user",
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
  it("should register a new trader", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        lastName: "Doe",
        username: "jahndoe",
        password: "PassworD@123",
        role: "trader",
        storeName: "Neeeeeeeeeey"
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
  it("should fail to register a new trader due to invalid role", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        lastName: "Doe",
        username: "jahndoe",
        password: "PassworD@123",
        role: "admin",
        storeName: "Neeeeeeeeeey"
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("should fail to register a new trader due to invalid input", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "PassworD@123",
        role: "trader",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("should fail to register a new user due to unique username constraint", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "PassworD@123",
        role: "user",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
    });

      it("should fail to register a new user due to password constraint", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        password: "Passwor123",
        role: "user",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it("should fail to register a new user due to invalid input", function (done) {
    chai
      .request(app)
      .post("/signUp")
      .send({
        firstName: "John",
        username: "johndoe",
        password: "PassworD@123",
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });
  it("should failt to log in a user", function (done) {
    chai
      .request(app)
      .post("/signIn")
      .send({
        username: "jondoe",
        password: "PassworD@123",
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it("should log in a user and return an access token", function (done) {
    chai
      .request(app)
      .post("/signIn")
      .send({
        username: "johndoe",
        password: "PassworD@123",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property("accessToken");
        done();
      });
  });


  after( async () => {
    try {
      await User.destroy({ where: {} });
      //  const pendingQueries = await sequelize.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'eshtrytest' AND state = 'active'");
      //  await Promise.all(pendingQueries.map(query => query.then(() => undefined)));
      await sequelize.close();
    } catch (error) {
      console.log(error);
    }
  });
 

});
