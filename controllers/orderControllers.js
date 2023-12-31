import CatchAsyncError from "../middleware/catchAsyncError.js";
import { connection } from "../utils/db.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const AdminUpdateOrder = CatchAsyncError(async (req, res) => {
  console.log(" update called");
  const orderId = req.params.id;

  const { status } = req.body;

  const sql = "UPDATE order_table SET status = ? WHERE id = ?";
  connection.query(sql, [status, orderId], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      console.log("Order status updated successfully");
      res.status(200).json({ message: "Order status updated successfully" });
    }
  });
});

export const AdminGetSpecificOrderDetails = CatchAsyncError(
  async (req, res) => {
    const orderId = req.params.id;
    // Perform a SQL query to fetch the data based on the provided ID
    const sql = "SELECT * FROM order_table WHERE id = ?";
    connection.query(sql, [orderId], (err, results) => {
      if (err) {
        res.status(500).json({ message: "Internal server error" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ message: "Data not found" });
        } else {
          res.status(200).json(results[0]); // Send the fetched data as a response
        }
      }
    });
  }
);

export const GetOrders = CatchAsyncError(async (req, res) => {
  const status = req.params.status;

  if (!status) {
    return res
      .status(400)
      .json({ message: "Status is required in the request body" });
  }
  let sql;
  let queryParameters;

  if (status === "8") {
    sql = "SELECT * FROM order_table WHERE status < ?";
    queryParameters = [8];
  } else {
    sql = "SELECT * FROM order_table WHERE status = ?";
    queryParameters = [status];
  }
  connection.query(sql, queryParameters, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      console.log(results);
      res.status(200).json({ results: results }); // Send the fetched data as a response
    }
  });
});

export const dimensionUpdate = CatchAsyncError(async (req, res, next) => {
  try {
    const { length, width, height, weight } = req.body;
    const req_id = req.user.id;
    const id = req.params.id; // Assuming you get the ID from the request parameters

    // Update the record in  the order_table
    connection.query(
      "UPDATE order_table SET byid=?,length = ?, width = ?, height = ?, weight = ?,status=? WHERE id = ?",
      [req_id, length, width, height, weight, 3, id],
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
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const dimensionOrderList = CatchAsyncError(async (req, res, next) => {
  try {
    connection.query(
      "SELECT * FROM order_table WHERE status= 2",
      async (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500)); // Handle database query error
        }

        if (results.length === 0) {
          return next(new ErrorHandler("No Orders", 400));
        }
        const data = results;

        res.status(200).json({
          success: true,
          message: "Orders",
          data,
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const labelOrderList = CatchAsyncError(async (req, res, next) => {
  try {
    connection.query(
      "SELECT * FROM order_table WHERE status= 3",
      async (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500)); // Handle database query error
        }
        console.log(results);
        if (results.length === 0) {
          return next(new ErrorHandler("No Orders", 400));
        }
        const data = results;
        res.status(200).json({
          success: true,
          message: "label Orders",
          data,
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const labelUpdate = CatchAsyncError(async (req, res, next) => {
  try {
    const { status } = req.body;
    const id = req.params.id;
    const req_id = req.user.id;
    let status1;
    if (status === true) {
      status1 = 4;
    } else {
      status1 = 3;
      return next(new ErrorHandler("Please Select The Check box", 500));
    }
    connection.query(
      "UPDATE order_table SET byid=?,fnsku_label_printed = ?,status=? WHERE id = ?",
      [req_id, status, status1, id],
      (error) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500));
        }

        res.status(200).json({
          success: true,
          message: "Label Updated successfully",
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const AccountOrders = CatchAsyncError(async (req, res, next) => {
  try {
    connection.query(
      "SELECT * FROM order_table WHERE status = 4",
      async (error, results) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500)); // Handle database query error
        }

        if (results.length === 0) {
          return next(new ErrorHandler("No Orders", 400));
        }
        const data = results;

        res.status(200).json({
          success: true,
          message: "Orders",
          data,
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const AdminUpdateOrderDetail = CatchAsyncError(
  async (req, res, next) => {
    console.log(req.body);
    try {
      const orderId = req.params.id; // Get the order ID from URL parameters
      const {
        name,
        service,
        product,
        unit,
        tracking_url,
        length,
        width,
        height,
        weight,
        amount,
        status,
      } = req.body;
      let amountValue;
      amountValue = amount === "" ? null : amount;
      amountValue = amount === null && null;
      console.log(amountValue);
      const fnskuFiles = req.files;
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

      connection.query(
        `UPDATE order_table SET 
          name = ?,
          service = ?,
          product = ?,
          unit = ?,
          tracking_url = ?,
          length = ?,
          width = ?,
          height = ?,
          weight = ?,
          amount = ?,
          status = ? 
          ${fnskuFile !== undefined ? ", fnsku = ?, fnsku_status = ?" : ""}
          ${boxlabel !== undefined ? ", label = ?, label_status = ?" : ""}
          WHERE id = ?`,
        [
          name,
          service,
          product,
          unit,
          tracking_url,
          length,
          width,
          height,
          weight,
          amountValue,
          status,
          ...(fnskuFile !== undefined ? [fnskuFile, fnskuStatus] : []),
          ...(boxlabel !== undefined ? [boxlabel, labelStatus] : []),
          orderId, // Place orderId as the last parameter
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
        }
      );
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const AmountUpdate = CatchAsyncError(async (req, res, next) => {
  try {
    const { amount } = req.body;
    const id = req.params.id;
    const req_id = req.user.id;

    connection.query(
      "UPDATE order_table SET byid=?,amount = ?,status=?,invoice=? WHERE id = ?",
      [req_id, amount, 5, true, id],
      (error) => {
        if (error) {
          return next(new ErrorHandler(error.message, 500));
        }
        res.status(200).json({
          success: true,
          message: "Invoice generated successfully",
        });
      }
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// export const AdminUpdateOrderDetail = CatchAsyncError(async (req, res) => {
//   console.log("Update order called");
//   try {
//     const orderId = req.params.id; // Get the order ID from URL parameters
//     const { customerName, servicesReq, productName, units, trackingUrl } =
//       req.body;
//     const fnskuFiles = req.files;
//     const fnskuFile = fnskuFiles["fnskuSend"]
//       ? fnskuFiles["fnskuSend"][0].filename
//       : undefined;
//     const boxlabel = fnskuFiles["labelSend"]
//       ? fnskuFiles["labelSend"][0].filename
//       : undefined;
//     let fnskuStatus = false;
//     let labelStatus = false;
//     if (fnskuFile !== undefined && boxlabel !== undefined) {
//       fnskuStatus = true;
//       labelStatus = true;
//     } else if (fnskuFile === undefined && boxlabel === undefined) {
//       fnskuStatus = false;
//       labelStatus = false;
//       console.log("false");
//     } else if (fnskuFile === undefined) {
//       fnskuStatus = false;
//       labelStatus = true;
//     } else {
//       fnskuStatus = true;
//       labelStatus = false;
//     }
//     console.log(fnskuFile,boxlabel)
//     connection.query(
//       "UPDATE order_table SET service=?, product=?, unit=?, tracking_url=?, fnsku=?, label=?,  fnsku_status=?, label_status=? WHERE id=?",
//       [
//         servicesReq,
//         productName,
//         units,
//         trackingUrl,
//         fnskuFile,
//         boxlabel,
//         fnskuStatus,
//         labelStatus,
//         orderId,
//       ],
//       (error, results) => {
//         if (error) {
//           return next(new ErrorHandler(error.message, 500));
//         }
//         if (results.affectedRows === 0) {
//           return next(new ErrorHandler("Order not found", 404));
//         }
//         res.status(200).json({
//           success: true,
//           message: "Order updated",
//         });
//         console.log("Order updated");
//       }
//     );
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });
