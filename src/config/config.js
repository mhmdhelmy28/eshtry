  /* eslint-env node */
  
    module.exports = {
        "development": {
          "username": "postgres",
          "password": "password",
          "database": `${process.env.DBNAME}`,
          "host": `${process.env.DBHOST}`,
          "dialect": "postgres"
        },
        "test": {
          "username": "postgres",
          "password": "password",
          "database": `${process.env.DB_TEST_NAME}`,
          "host": `${process.env.DB_TEST_HOST}`,
          "dialect": "postgres"
        },
        "production": {
          "username": "postgres",
          "password": "password",
          "database": "prod_database",
          "host": "127.0.0.1",
          "dialect": "postgres"
        }
      }