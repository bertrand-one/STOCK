const express = require('express');
const router = express.Router();

module.exports = (pool, isAuthenticated) => {
  // Get stock movement report (both in and out) by date range
  router.get('/stock-movement', isAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate, reportType } = req.query;

      console.log('Report request:', { reportType, startDate, endDate });

      // Default to daily report if no type is specified
      const type = reportType || 'daily';
      let stockMovement = [];
      let stockInDetails = [];
      let stockOutDetails = [];

      try {
        // Set date range based on report type
        if (type === 'daily') {
          // For daily report, use current date
          const today = new Date().toISOString().split('T')[0];
          console.log('Daily report for:', today);

          // Get stock movement summary
          [stockMovement] = await pool.query(`
            SELECT
              p.id AS product_id,
              p.pcode,
              p.pname,
              p.quantity AS current_quantity,
              COALESCE(SUM(CASE WHEN si.date >= '${today} 00:00:00' AND si.date <= '${today} 23:59:59' THEN si.quantity ELSE 0 END), 0) AS total_stock_in,
              COALESCE(SUM(CASE WHEN so.date >= '${today} 00:00:00' AND so.date <= '${today} 23:59:59' THEN so.quantity ELSE 0 END), 0) AS total_stock_out
            FROM
              products p
            LEFT JOIN
              stockin si ON p.id = si.product_id
            LEFT JOIN
              stockout so ON p.id = so.product_id
            GROUP BY
              p.id, p.pcode, p.pname, p.quantity
            ORDER BY
              p.pname
          `);

          // Get stock in details
          [stockInDetails] = await pool.query(`
            SELECT
              si.id,
              si.product_id,
              p.pcode,
              p.pname,
              si.quantity,
              si.date,
              si.notes,
              'IN' AS movement_type
            FROM
              stockin si
            JOIN
              products p ON si.product_id = p.id
            WHERE
              si.date >= '${today} 00:00:00' AND si.date <= '${today} 23:59:59'
            ORDER BY
              si.date DESC
          `);

          // Get stock out details
          [stockOutDetails] = await pool.query(`
            SELECT
              so.id,
              so.product_id,
              p.pcode,
              p.pname,
              so.quantity,
              so.date,
              so.notes,
              'OUT' AS movement_type
            FROM
              stockout so
            JOIN
              products p ON so.product_id = p.id
            WHERE
              so.date >= '${today} 00:00:00' AND so.date <= '${today} 23:59:59'
            ORDER BY
              so.date DESC
          `);

        } else if (type === 'monthly') {
          // For monthly report, use current month
          const date = new Date();
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
          const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
          console.log('Monthly report from:', firstDay, 'to:', lastDay);

          // Get stock movement summary
          [stockMovement] = await pool.query(`
            SELECT
              p.id AS product_id,
              p.pcode,
              p.pname,
              p.quantity AS current_quantity,
              COALESCE(SUM(CASE WHEN si.date >= '${firstDay} 00:00:00' AND si.date <= '${lastDay} 23:59:59' THEN si.quantity ELSE 0 END), 0) AS total_stock_in,
              COALESCE(SUM(CASE WHEN so.date >= '${firstDay} 00:00:00' AND so.date <= '${lastDay} 23:59:59' THEN so.quantity ELSE 0 END), 0) AS total_stock_out
            FROM
              products p
            LEFT JOIN
              stockin si ON p.id = si.product_id
            LEFT JOIN
              stockout so ON p.id = so.product_id
            GROUP BY
              p.id, p.pcode, p.pname, p.quantity
            ORDER BY
              p.pname
          `);

          // Get stock in details
          [stockInDetails] = await pool.query(`
            SELECT
              si.id,
              si.product_id,
              p.pcode,
              p.pname,
              si.quantity,
              si.date,
              si.notes,
              'IN' AS movement_type
            FROM
              stockin si
            JOIN
              products p ON si.product_id = p.id
            WHERE
              si.date >= '${firstDay} 00:00:00' AND si.date <= '${lastDay} 23:59:59'
            ORDER BY
              si.date DESC
          `);

          // Get stock out details
          [stockOutDetails] = await pool.query(`
            SELECT
              so.id,
              so.product_id,
              p.pcode,
              p.pname,
              so.quantity,
              so.date,
              so.notes,
              'OUT' AS movement_type
            FROM
              stockout so
            JOIN
              products p ON so.product_id = p.id
            WHERE
              so.date >= '${firstDay} 00:00:00' AND so.date <= '${lastDay} 23:59:59'
            ORDER BY
              so.date DESC
          `);

        } else if (type === 'custom' && startDate && endDate) {
          // For custom range
          console.log('Custom report from:', startDate, 'to:', endDate);

          // Get stock movement summary
          [stockMovement] = await pool.query(`
            SELECT
              p.id AS product_id,
              p.pcode,
              p.pname,
              p.quantity AS current_quantity,
              COALESCE(SUM(CASE WHEN si.date >= '${startDate} 00:00:00' AND si.date <= '${endDate} 23:59:59' THEN si.quantity ELSE 0 END), 0) AS total_stock_in,
              COALESCE(SUM(CASE WHEN so.date >= '${startDate} 00:00:00' AND so.date <= '${endDate} 23:59:59' THEN so.quantity ELSE 0 END), 0) AS total_stock_out
            FROM
              products p
            LEFT JOIN
              stockin si ON p.id = si.product_id
            LEFT JOIN
              stockout so ON p.id = so.product_id
            GROUP BY
              p.id, p.pcode, p.pname, p.quantity
            ORDER BY
              p.pname
          `);

          // Get stock in details
          [stockInDetails] = await pool.query(`
            SELECT
              si.id,
              si.product_id,
              p.pcode,
              p.pname,
              si.quantity,
              si.date,
              si.notes,
              'IN' AS movement_type
            FROM
              stockin si
            JOIN
              products p ON si.product_id = p.id
            WHERE
              si.date >= '${startDate} 00:00:00' AND si.date <= '${endDate} 23:59:59'
            ORDER BY
              si.date DESC
          `);

          // Get stock out details
          [stockOutDetails] = await pool.query(`
            SELECT
              so.id,
              so.product_id,
              p.pcode,
              p.pname,
              so.quantity,
              so.date,
              so.notes,
              'OUT' AS movement_type
            FROM
              stockout so
            JOIN
              products p ON so.product_id = p.id
            WHERE
              so.date >= '${startDate} 00:00:00' AND so.date <= '${endDate} 23:59:59'
            ORDER BY
              so.date DESC
          `);

        } else {
          return res.status(400).json({ message: 'Invalid report parameters' });
        }

        // Calculate net change for each product
        stockMovement = stockMovement.map(product => {
          const stockIn = parseInt(product.total_stock_in) || 0;
          const stockOut = parseInt(product.total_stock_out) || 0;
          return {
            ...product,
            total_stock_in: stockIn,
            total_stock_out: stockOut,
            net_change: stockIn - stockOut
          };
        });

        // Combine and sort by date
        const movementDetails = [...stockInDetails, ...stockOutDetails].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        console.log(`Report generated successfully: ${stockMovement.length} products, ${movementDetails.length} movements`);

        res.status(200).json({
          summary: stockMovement,
          details: movementDetails
        });
      } catch (dbError) {
        console.error('Database error in report generation:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
  });

  // Get current stock levels
  router.get('/current-stock', isAuthenticated, async (req, res) => {
    try {
      console.log('Fetching current stock levels');

      try {
        // First, get all products
        const [products] = await pool.query(`
          SELECT
            id, pcode, pname, quantity, created_at, updated_at
          FROM
            products
          ORDER BY
            pname
        `);

        // For each product, get total stock in and out
        const currentStock = await Promise.all(products.map(async (product) => {
          // Get total stock in
          const [stockInResult] = await pool.query(`
            SELECT COALESCE(SUM(quantity), 0) AS total_stock_in
            FROM stockin
            WHERE product_id = ?
          `, [product.id]);

          // Get total stock out
          const [stockOutResult] = await pool.query(`
            SELECT COALESCE(SUM(quantity), 0) AS total_stock_out
            FROM stockout
            WHERE product_id = ?
          `, [product.id]);

          const totalStockIn = stockInResult[0].total_stock_in;
          const totalStockOut = stockOutResult[0].total_stock_out;

          return {
            ...product,
            total_stock_in: totalStockIn,
            total_stock_out: totalStockOut
          };
        }));

        console.log(`Current stock fetched successfully: ${currentStock.length} products`);
        res.status(200).json(currentStock);
      } catch (dbError) {
        console.error('Database error in current stock fetch:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
    } catch (error) {
      console.error('Error fetching current stock:', error);
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
  });

  return router;
};
