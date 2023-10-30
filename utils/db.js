import mysql from "mysql"
// Set up MySQL database connection

 export const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root1234",
    database: "prepdatabase",
  });
  
 