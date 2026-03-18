import { app } from "./src/app.js";
import connectDb from "./src/config/db.js";
import { ENV } from "./src/config/env.js";
import http from "http";
import { initSocket } from "./src/sockets/socket.js";

const port = ENV.port || 3000;

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    await connectDb();
    server.listen(port, () => {
      console.log(`app is running on - http://localhost:${port}`);
    });
  } catch (error) {
    console.error("server start failed:", error.message);
    process.exit(1);
  }
};

startServer();
