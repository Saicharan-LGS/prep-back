import { createCustomerTable } from "./customerTable.js";
import { connection } from "../utils/db.js";
import { staffTable } from "./staffTable.js";
import { productTable } from "./productTable.js";
import { orderTable } from "./orderTable.js";

const tablesToCreate = [
  {
    tableName: "createCustomerTable",
    sql: createCustomerTable,
  },
  {
    tableName: "staffTable",
    sql: staffTable,
  },
  {
    tableName: "productTable",
    sql: productTable,
  },
  {
    tableName: "orderTable",
    sql: orderTable,
  },
];

export const createTables = () => {
  for (const table of tablesToCreate) {
    connection.query(table.sql, (err) => {
      if (err) throw err;
      console.log(`${table.tableName} table created successfully!`);
    });
  }
};
