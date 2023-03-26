// const https = require('https');
// const fs = require('fs');
// const options = {
//   key: fs.readFileSync('./server.key'),
//   cert: fs.readFileSync('./server.crt')
// };

const { initDatabase } = require("./src/models/index");
const app = require("./app");

// (async () => {
//   try {
//     await initDatabase();
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// })();
// const server = https.createServer(options, app);
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
