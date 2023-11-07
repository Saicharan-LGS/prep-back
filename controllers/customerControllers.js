import { connection } from "../utils/db.js";
import CatchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

export const customerRegistration = CatchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    connection.query(
      "SELECT * FROM customers WHERE email = ?",
      [email],
      (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500)); // Handle database query error
        }

        if (results.length > 0) {
          return next(new ErrorHandler("Email already exists", 400));
        }

        // Hash the user's password before storing it in the database
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            return next(new ErrorHandler(err.message, 500));
          }

          // Insert user data into the database with the hashed password
          connection.query(
            "INSERT INTO customers (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword],
            (error) => {
              if (error) {
                return next(new ErrorHandler(error.message, 500)); // Handle database insertion error
              }

              // Send an email after successful registration
              const transporter = nodemailerConfig();
              const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: email, // The recipient's email address
                subject: "Welcome to AX Xpress! Your Account Details",
                text: ` Dear ${name},\n\nThank you for registering with AX Xpress. We are delighted to have you as part of our community, and we want to extend a warm welcome to you.\n\nYour account is now active and ready for use. To make sure you have all the information you need, we are providing your login credentials below:\n\nEmail: ${email}\nTemporary Password: ${password}`,
              };

              transporter.sendMail(mailOptions, (emailError, info) => {
                if (emailError) {
                  return next(new ErrorHandler("Email could not be sent", 500));
                }
                console.log("Email sent:", info.response);
              });

              res.status(201).json({
                success: true,
                message: "Customer Registered successfully",
              });
            }
          );
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

const SECRET_KEY = process.env.SECRET_KEY;

export const customerLogin = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    // Check if the email exists in the database
    connection.query(
      "SELECT * FROM customers WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500)); // Handle database query error
        }

        if (results.length === 0) {
          return next(new ErrorHandler("Invalid email or password", 400));
        }

        const user = results[0];
        // Check if the provided password matches the one in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
          return next(new ErrorHandler("Invalid email or password", 400));
        }
        // Create a JWT token
        const token = jwt.sign({ email: user.email }, SECRET_KEY, {
          expiresIn: "78h",
        });

        res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          role: "customer",
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const customerorder = async (req, res, next) => {
  console.log("customer called");
  try {
    const { service, product, units, tracking_url, date, customer_id } =
      req.body;
    console.log(req.body);
    const req_id = req.user.id;
    const name = req.user.name;
    const fnskuFiles = req.files;
    const fnskuFile = fnskuFiles["fnskuSend"]
      ? fnskuFiles["fnskuSend"][0].filename
      : undefined;
    const boxlabel = fnskuFiles["labelSend"]
      ? fnskuFiles["labelSend"][0].filename
      : undefined;
    let fnskuStatus = false;
    let labelStatus = false;
    if (fnskuFile !== undefined && boxlabel !== undefined) {
      fnskuStatus = true;
      labelStatus = true;
    } else if (fnskuFile === undefined && boxlabel === undefined) {
      fnskuStatus = false;
      labelStatus = false;
      console.log("false");
    } else if (fnskuFile === undefined) {
      fnskuStatus = false;
      labelStatus = true;
    } else {
      fnskuStatus = true;
      labelStatus = false;
    }
    connection.query(
      "INSERT INTO order_table (byid, customer_id, name, service, product, unit, tracking_url, fnsku, label, date, status,fnsku_status,label_status) VALUES (?, ?, ?, ?,?, ?, ?, ?, ?,?,?,?,?)",
      [
        req_id,
        customer_id,
        name,
        service,
        product,
        units,
        tracking_url,
        fnskuFile,
        boxlabel,
        date,
        0,
        fnskuStatus,
        labelStatus,
      ],
      (error) => {
        if (error) {
          console.log(error);
          return next(new ErrorHandler(error.message, 500));
        }
        res.status(201).json({
          success: true,
          message: "Order Placed",
        });
        console.log("Order posted");
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
};

export const customerData = CatchAsyncError(async (req, res, next) => {
  try {
    const name = req.user.name;
    const id = req.user.id;
    res.status(201).json({
      success: true,
      name,
      id,
      message: "Customer Details",
    });
    console.log(name);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const customerOrderList = CatchAsyncError(async (req, res, next) => {
  console.log("customer list called");
  try {
    const customer_id = req.user.id;
    const status = req.params.id;

    console.log(customer_id, status);

    if (status === "8") {
      // If status is 8, change the query to get all products with a status below 8
      connection.query(
        "SELECT * FROM order_table WHERE customer_id = ? AND status < 8",
        [customer_id],
        (error, results) => {
          if (error) {
            return next(new ErrorHandler(error.message, 500)); // Handle database query error
          }
          if (results.length > 0) {
            // If there are orders matching the criteria, return them
            console.log(results);
            res.status(200).json({
              success: true,
              results,
            });
          } else {
            return next(
              new ErrorHandler("No orders with a status below 8", 404)
            );
          }
        }
      );
    } else {
      // For other status values, use the original query
      connection.query(
        "SELECT * FROM order_table WHERE customer_id = ? AND status = ?",
        [customer_id, status],
        (error, results) => {
          if (error) {
            return next(new ErrorHandler(error.message, 500)); // Handle database query error
          }
          if (results.length > 0) {
            res.status(200).json({
              success: true,
              results,
            });
          } else {
            return next(
              new ErrorHandler("No orders with the specified status", 404)
            );
          }
        }
      );
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const AcceptOrder = CatchAsyncError(async (req, res) => {
  const { id } = req.params; // Get the "id" from the URL parameters
  const customer_id = req.user.id;
  console.log(customer_id, "amount called");
  const { amount } = req.body;
  console.log(amount);
  connection.query(
    "UPDATE order_table SET status=?, payment_status=? WHERE id = ?",
    [6, true, id],
    (error) => {
      if (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      res.status(200).json({
        success: true,
        message: "Dimension Updated successfully",
      });
    }
  );
  // Create the INSERT SQL query with the "id" from the request parameters
  const insertQuery = `INSERT INTO transaction_table ( customer_id, order_id, amount, type) VALUES (?, ?, ?, ?)`;
  // Execute the query
  connection.query(
    insertQuery,
    [customer_id, id, `-${amount}`, "debit"],
    (error, results) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Error inserting data" });
      } else {
        console.log("Data inserted successfully");
        res.status(200).json({ message: "Data inserted successfully" });
      }
    }
  );
});
export const DeclineOrder = CatchAsyncError(async (req, res) => {
  console.log("decline called");
  const orderId = req.params.id;

  const { status } = req.body;

  const sql = "UPDATE order_table SET status = ? WHERE id = ?";
  connection.query(sql, [status, orderId], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log("Order status updated successfully");
      res.status(200).json({ message: "Order status updated successfully" });
    }
  });
});

export const CustomerAddAmount = CatchAsyncError(async (req, res) => {
  // Get the "id" from the URL parameters
  const customer_id = req.user.id;
  console.log(customer_id, "amount called");
  const { amount } = req.body;
  console.log(amount);
  // Create the INSERT SQL query with the "id" from the request parameters
  const insertQuery = `INSERT INTO transaction_table ( customer_id, amount, type) VALUES (?, ?, ?)`;

  // Execute the query
  connection.query(
    insertQuery,
    [customer_id, `+${amount}`, "credit"],
    (error, results) => {
      if (error) {
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Error inserting data" });
      } else {
        console.log("Data inserted successfully");
        res.status(200).json({ message: "Data inserted successfully" });
      }
    }
  );
});

export const customerDetails = CatchAsyncError(async (req, res, next) => {
  try {
    connection.query("SELECT * FROM customers ", async (error, results) => {
      if (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      res.status(200).json({
        success: true,
        message: "customer Data",
        customerMembers: results,
      });
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


export const CustomerUpdateDetail = CatchAsyncError(
  async (req, res, next) => {
    try {
      const orderId = req.params.id; // Get the order ID from URL parameters
      const { name, service, product, unit, tracking_url } = req.body;
      console.log(req.body.fnskuSend);
      console.log(req.body);
      const fnskuFiles = req.files;
      console.log(fnskuFiles, req.body);
      const fnskuFile = fnskuFiles["fnskuSend"]
        ? fnskuFiles["fnskuSend"][0].filename
        : undefined;
      const boxlabel = fnskuFiles["labelSend"]
        ? fnskuFiles["labelSend"][0].filename
        : undefined;
      let fnskuStatus = false;
      let labelStatus = false;

      if (fnskuFile !== undefined) {
        fnskuStatus = true;
      }

      if (boxlabel !== undefined) {
        labelStatus = true;
      }

      console.log(fnskuFile, boxlabel);
      connection.query(
        `UPDATE order_table SET 
           name=?,
          service = ?,
          product = ?,
          unit = ?,
          tracking_url = ? 
          ${fnskuFile !== undefined ? ", fnsku = ?, fnsku_status = ?" : ""}
          ${boxlabel !== undefined ? ", label = ?, label_status = ?" : ""}
          WHERE id = ?`,
        [
          name,
          service,
          product,
          unit,
          tracking_url,
          ...(fnskuFile !== undefined ? [fnskuFile, fnskuStatus] : []),
          ...(boxlabel !== undefined ? [boxlabel, labelStatus] : []),
          Number(orderId), 
        ],
        (error, results) => {
          if (error) {
            return next(new ErrorHandler(error.message, 500));
          }
          if (results.affectedRows === 0) {
            return next(new ErrorHandler("Order not found", 404));
          }
          res.status(200).json({
            success: true,
            message: "Order updated",
          });
          console.log("Order updated");
        }
      );
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);