import CatchAsyncError from "./catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { connection } from "../utils/db.js";
import jwt from "jsonwebtoken";

// authenticated user
export const isAuthenticated = CatchAsyncError(async (req, res, next) => {
  console.log("called")
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(new ErrorHandler("Please provide an access token", 400));
  }
  const access_token = authorizationHeader.split(" ")[1];
  if (!access_token) {
    return next(new ErrorHandler("Please login to access this resource", 400));
  }

  try {
    const decoded = jwt.verify(access_token, process.env.SECRET_KEY);
    console.log(decoded, "4444")
    if (!decoded) {
      console.log("decline called")
      return next(new ErrorHandler("Access token is not valid", 400));
    }

    // Query the user data from your MySQL database
    connection.query(
      "SELECT * FROM staff_table WHERE email = ?",
      [decoded.email],
      (error, results) => {
        if (error) {
          return next(new ErrorHandler("Error while fetching staff data", 500));
        }

        if (results.length === 0) {
          return next(new ErrorHandler("Staff not found", 404));
        }

        const user = results[0];
        console.log(user);
        req.user = user;
        next();
      }
    );
  } catch (error) {
    return next(new ErrorHandler("Error while verifying access token", 400));
  }
});

// validate user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};

// authenticated customer
export const isAuthenticatedCustomer = CatchAsyncError(
  async (req, res, next) => {
    console.log("auth called");

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(new ErrorHandler("Please provide an access token", 400));
    }
    const access_token = authorizationHeader.split(" ")[1];
    console.log(access_token);
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    try {
      const decoded = jwt.verify(access_token, process.env.SECRET_KEY);
      console.log(decoded);
      if (!decoded) {
        return next(new ErrorHandler("Access token is not valid", 400));
      }

      // Query the user data from your MySQL database
      connection.query(
        "SELECT * FROM customers WHERE email = ?",
        [decoded.email],
        (error, results) => {
          if (error) {
            return next(
              new ErrorHandler("Error while fetching staff data", 500)
            );
          }
          if (results.length === 0) {
            return next(new ErrorHandler("Customer not found", 404));
          }
          const user = results[0];
          req.user = user;
          next();
        }
      );
    } catch (error) {
      return next(new ErrorHandler("Error while verifying access token", 400));
    }
  }
);
