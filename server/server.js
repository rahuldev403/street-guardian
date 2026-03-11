import { app } from "./src/app.js";
import connectDb from "./src/config/db.js";
import { ENV } from "./src/config/env.js";

const port = 3000 | ENV.port;

app.listen(port, () => {
  console.log(`app is running on - http://localhost:${port}`);
  connectDb();
});
