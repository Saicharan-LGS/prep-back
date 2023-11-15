import { app } from "./app.js";
import { connection } from "./utils/db.js";
import { createTables } from "./models/table.js";
import dotenv from "dotenv";
dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});

connection.connect((err) => {
  if (err) throw err;
  createTables();
});
