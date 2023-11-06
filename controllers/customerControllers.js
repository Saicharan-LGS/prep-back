import { connection } from "../utils/db.js";
import CatchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

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
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const customerorder = async (req, res, next) => {
  console.log("custiomer caled");
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
      "INSERT INTO order_table (byid,customer_id, name, service, product, unit, tracking_url, fnsku, label,date,status,fnsku_status,label_status) VALUES (?, ?, ?, ?,?, ?, ?, ?, ?,?,?,?,?)",
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
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const customerOrderList = CatchAsyncError(async (req, res, next) => {
  try {
    const customer_id = req.user.id;
    connection.query(
      "SELECT * FROM order_table WHERE customer_id = ?",
      [customer_id],
      (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500)); // Handle database query error
        }

        if (results.length > 0) {
          // If there are orders, return them
          res.status(201).json({
            success: true,
            orderList: results,
          });
        } else {
          // If there are no orders, return an error
          return next(new ErrorHandler("No orders", 400));
        }
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
