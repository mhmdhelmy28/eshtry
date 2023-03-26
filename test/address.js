const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
const { execSync } = require("child_process");

const app = require("../app.js");
const User = require("../src/models/user.js");
const { sequelize, initDatabase } = require("../src/models/index.js");
const Address = require("../src/models/address.js");

chai.use(chaiHttp);

describe("Address API", () => {
  let token;
  let userId;
  let addressId;
  before(async () => {
    await initDatabase();

    const username = "Jooe";
    const firstName = "Joe";
    const lastName = "Doe";
    const password = "PassworD@123";
    try {
      execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
      const user = await chai.request(app).post("/signUp").send({
        firstName: firstName,
        lastName: lastName,
        username: username,
        password: password,
        role: "user",
      });
      userId = user.body.user.id;
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
  after(async () => {
    await User.destroy({ where: {} });
    await Address.destroy({ where: {} });
  });
  describe("POST /signIn", () => {
    it("should authenticate user and return JWT token", (done) => {
      chai
        .request(app)
        .post("/signIn")
        .send({
          username: "Jooe",
          password: "PassworD@123",
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("accessToken");
          token = res.body.accessToken;
          done();
        });
    });
  });

  describe("POST /address", () => {
    it("should create a new address", (done) => {
      chai
        .request(app)
        .post("/address")
        .set("Authorization", `Bearer ${token}`)
        .send({
          city: "New York",
          street: "123 Main St",
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("id");
          addressId = res.body.id;
          expect(res.body).to.have.property("city").to.equal("New York");
          expect(res.body).to.have.property("street").to.equal("123 Main St");
          done();
        });
    });

    it("should return an error if city is missing", (done) => {
      chai
        .request(app)
        .post("/address")
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "123 Main St",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message").to.equal("street and city are required.");
          done();
        });
    });

    it("should return an error if street is missing", (done) => {
      chai
        .request(app)
        .post("/address")
        .set("Authorization", `Bearer ${token}`)
        .send({
          city: "New York",
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message").to.equal("street and city are required.");
          done();
        });
    });

    it("should get all user addresses", (done) => {
      chai
        .request(app)
        .get("/address")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(res.body[0]).to.have.property("id");
          expect(res.body[0]).to.have.property("UserId").to.equal(userId);
          expect(res.body[0]).to.have.property("city").to.equal("New York");
          expect(res.body[0]).to.have.property("street").to.equal("123 Main St");
          done();
        });
    });

    describe("GET /address/:id", () => {
      it("should get an address by valid id", (done) => {
        chai
          .request(app)
          .get(`/address/${addressId}`)
          .set("Authorization", `Bearer ${token}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("id").to.equal(addressId);
            expect(res.body).to.have.property("UserId").to.equal(userId);
            expect(res.body).to.have.property("city").to.equal("New York");
            expect(res.body).to.have.property("street").to.equal("123 Main St");
            done();
          });
      });

      it("should not get an address by invalid id", (done) => {
        chai
          .request(app)
          .get(`/addresses/123`)
          .set("Authorization", `Bearer ${token}`)
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
      });
    });
  });
});
