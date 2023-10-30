import { app } from "./app.js";
import { connection } from "./utils/db.js";
import { createTables } from "./models/table.js";
const port = 3009;

app.listen(port, () => {
  console.log("listening on port 3009");
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");

  createTables();
});
