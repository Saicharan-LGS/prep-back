import CatchAsyncError from "../middleware/catchAsyncError.js";
import { connection } from "../utils/db.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const AdminUpdateOrder = CatchAsyncError(async (req, res) => {
  console.log(" update called");
  const orderId = req.params.id;
  console.log(orderId);
  const { status } = req.body;
  console.log(req.body);
  console.log(status);
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

export const AdminGetSpecificOrderDetails = CatchAsyncError(
  async (req, res) => {
    const orderId = req.params.id;
    console.log(orderId);
    // Perform a SQL query to fetch the data based on the provided ID
    const sql = "SELECT * FROM order_table WHERE id = ?";
    connection.query(sql, [orderId], (err, results) => {
      if (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: "Data not found" });
        } else {
          res.status(200).json(results[0]); // Send the fetched data as a response
        }
      }
    });
  }
);

export const GetOrders = CatchAsyncError(async (req, res) => {
  const status = req.params.status;
  console.log(status);

  if (!status) {
    return res
      .status(400)
      .json({ error: "Status is required in the request body" });
  }
  // Perform a SQL query to fetch products from the order_table based on the provided status
  const sql = "SELECT * FROM order_table WHERE status = ?";

  connection.query(sql, [status], (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).json({ error: "Internal server error" });
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

    // Update the record in the order_table
    connection.query(
      "UPDATE order_table SET byid=?,length = ?, width = ?,status=? height = ?, weight = ? WHERE id = ?",
      [req_id, length, width, 3, height, weight, id],
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
    console.log(id);
    const req_id = req.user.id;

    connection.query(
      "UPDATE order_table SET byid=?,fnsku_label_printed = ?,status=? WHERE id = ?",
      [req_id, status, 4, id],
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

export const AdminUpdateOrderDetail = CatchAsyncError(
  async (req, res, next) => {
    console.log("Update order called");
    try {
      const orderId = req.params.id; // Get the order ID from URL parameters
      console.log(orderId);
      const { customerName, servicesReq, productName, units, trackingUrl } =
        req.body;
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
          customerName,
          servicesReq,
          productName,
          units,
          trackingUrl,
          ...(fnskuFile !== undefined ? [fnskuFile, fnskuStatus] : []),
          ...(boxlabel !== undefined ? [boxlabel, labelStatus] : []),
          Number(orderId), // Ensure orderId is treated as a numeric value
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

export const AmountUpdate = CatchAsyncError(async (req, res, next) => {
  try {
    const { amount } = req.body;
    const id = req.params.id;
    console.log(id);
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
          message: "Dimension Updated successfully",
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
