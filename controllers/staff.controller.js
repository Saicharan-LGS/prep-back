import { connection } from "../utils/db.js";
import CatchAsyncError from "../middleware/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import nodemailerConfig from "../utils/nodemailerConfig.js";

dotenv.config();

export const staffRegistration = CatchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    connection.query(
      "SELECT * FROM staff_table WHERE email = ?",
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
            "INSERT INTO staff_table (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (error) => {
              if (error) {
                return next(new ErrorHandler(error.message, 500)); // Handle database insertion error
              }

              // Send an email after successful registration
              const transporter = nodemailerConfig();
              const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: email, // The recipient's email address
                subject: "Welcome to Our Staff Portal",
                text: `Dear ${name},\n\nThank you for registering with our staff portal. Your staff account is now active and ready for use. Your role is: ${role}\n\nYou can now log in with your email and password:${password}.`,
              };

              transporter.sendMail(mailOptions, (emailError, info) => {
                if (emailError) {
                  return next(new ErrorHandler("Email could not be sent", 500));
                }
                console.log("Email sent:", info.response);
              });

              res.status(201).json({
                success: true,
                message: "Staff Registered successfully",
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

export const staffLogin = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    // Check if the email exists in the database
    connection.query(
      "SELECT * FROM staff_table WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500));
        }

        if (results.length === 0) {
          return next(new ErrorHandler("Invalid email or password", 400));
        }

        const user = results[0];
        const role = user.role;
        const name = user.name;
        // Check if the provided password matches the one in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
          return next(new ErrorHandler("Invalid email or password", 400));
        }

        // Create a JWT token
        const token = jwt.sign({ email: user.email }, SECRET_KEY, {
          expiresIn: "72h",
        });

        res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          role,
          name,
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const staffData = CatchAsyncError(async (req, res, next) => {
  try {
    const name = req.user.name;
    const role = req.user.role;
    res.status(201).json({
      success: true,
      name,
      role,
      message: "Staff Details",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const staffMebmers = CatchAsyncError(async (req, res, next) => {
  try {
    connection.query("SELECT * FROM staff_table ", async (error, results) => {
      if (error) {
        return next(new ErrorHandler(error.message, 500));
      }

      res.status(200).json({
        success: true,
        message: "staff Data",
        staffMembers: results,
      });
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});
