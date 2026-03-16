import { app } from "./src/app.js";
import connectDb from "./src/config/db.js";
import { ENV } from "./src/config/env.js";
import http from "http";
import { initSocket } from "./src/sockets/socket.js";

const port = ENV.port || 3000;

const server = http.createServer(app);
initSocket(server);

server.listen(port, () => {
  connectDb();
  console.log(`app is running on - http://localhost:${port}`);
});
