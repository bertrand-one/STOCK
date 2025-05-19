const express = require('express');
const router = express.Router();

module.exports = (pool, isAuthenticated) => {
  // Get all stock-in records
  router.get('/', isAuthenticated, async (req, res) => {
    try {
      const [stockInRecords] = await pool.query(`
        SELECT s.*, p.pcode, p.pname
        FROM stockin s
        JOIN products p ON s.product_id = p.id
        ORDER BY s.date DESC
      `);

      res.status(200).json(stockInRecords);
    } catch (error) {
      console.error('Error fetching stock-in records:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get stock-in records for a specific product
  router.get('/product/:productId', isAuthenticated, async (req, res) => {
    try {
      const [stockInRecords] = await pool.query(`
        SELECT s.*, p.pcode, p.pname
        FROM stockin s
        JOIN products p ON s.product_id = p.id
        WHERE s.product_id = ?
        ORDER BY s.date DESC
      `, [req.params.productId]);

      res.status(200).json(stockInRecords);
    } catch (error) {
      console.error('Error fetching stock-in records for product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create a new stock-in record
  router.post('/', isAuthenticated, async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { product_id, quantity, notes } = req.body;

      // Validate input
      if (!product_id || !quantity) {
        await connection.rollback();
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }

      if (isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Quantity must be a positive number' });
      }

      // Check if product exists
      const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [product_id]);

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Product not found' });
      }

      // Insert stock-in record
      const [result] = await connection.query(
        'INSERT INTO stockin (product_id, quantity, notes) VALUES (?, ?, ?)',
        [product_id, quantity, notes || null]
      );

      // Update product quantity
      await connection.query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [quantity, product_id]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Stock added successfully',
        stockIn: {
          id: result.insertId,
          product_id,
          quantity,
          notes: notes || null,
          date: new Date()
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error adding stock:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

  // Update a stock-in record
  router.put('/:id', isAuthenticated, async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { quantity, notes } = req.body;

      // Validate input
      if (!quantity) {
        await connection.rollback();
        return res.status(400).json({ message: 'Quantity is required' });
      }

      if (isNaN(quantity) || quantity <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: 'Quantity must be a positive number' });
      }

      // Check if stock-in record exists
      const [stockInRecords] = await connection.query('SELECT * FROM stockin WHERE id = ?', [req.params.id]);

      if (stockInRecords.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Stock-in record not found' });
      }

      const stockInRecord = stockInRecords[0];

      // Update product quantity (remove old quantity, add new quantity)
      await connection.query(
        'UPDATE products SET quantity = quantity - ? + ? WHERE id = ?',
        [stockInRecord.quantity, quantity, stockInRecord.product_id]
      );

      // Update stock-in record
      await connection.query(
        'UPDATE stockin SET quantity = ?, notes = ? WHERE id = ?',
        [quantity, notes || null, req.params.id]
      );

      await connection.commit();

      res.status(200).json({
        message: 'Stock-in record updated successfully',
        stockIn: {
          id: parseInt(req.params.id),
          product_id: stockInRecord.product_id,
          quantity,
          notes: notes || null,
          date: stockInRecord.date
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating stock-in record:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

  // Delete a stock-in record
  router.delete('/:id', isAuthenticated, async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if stock-in record exists
      const [stockInRecords] = await connection.query('SELECT * FROM stockin WHERE id = ?', [req.params.id]);

      if (stockInRecords.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Stock-in record not found' });
      }

      const stockInRecord = stockInRecords[0];

      // Update product quantity
      await connection.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [stockInRecord.quantity, stockInRecord.product_id]
      );

      // Delete stock-in record
      await connection.query('DELETE FROM stockin WHERE id = ?', [req.params.id]);

      await connection.commit();

      res.status(200).json({ message: 'Stock-in record deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting stock-in record:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

  return router;
};
