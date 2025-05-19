const express = require('express');
const router = express.Router();

module.exports = (pool, isAuthenticated) => {
  // Get all stock-out records
  router.get('/', isAuthenticated, async (req, res) => {
    try {
      const [stockOutRecords] = await pool.query(`
        SELECT s.*, p.pcode, p.pname
        FROM stockout s
        JOIN products p ON s.product_id = p.id
        ORDER BY s.date DESC
      `);

      res.status(200).json(stockOutRecords);
    } catch (error) {
      console.error('Error fetching stock-out records:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get stock-out records for a specific product
  router.get('/product/:productId', isAuthenticated, async (req, res) => {
    try {
      const [stockOutRecords] = await pool.query(`
        SELECT s.*, p.pcode, p.pname
        FROM stockout s
        JOIN products p ON s.product_id = p.id
        WHERE s.product_id = ?
        ORDER BY s.date DESC
      `, [req.params.productId]);

      res.status(200).json(stockOutRecords);
    } catch (error) {
      console.error('Error fetching stock-out records for product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create a new stock-out record
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

      const product = products[0];

      // Check if there's enough stock
      if (product.quantity < quantity) {
        await connection.rollback();
        return res.status(400).json({ message: 'Not enough stock available' });
      }

      // Insert stock-out record
      const [result] = await connection.query(
        'INSERT INTO stockout (product_id, quantity, notes) VALUES (?, ?, ?)',
        [product_id, quantity, notes || null]
      );

      // Update product quantity
      await connection.query(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [quantity, product_id]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Stock removed successfully',
        stockOut: {
          id: result.insertId,
          product_id,
          quantity,
          notes: notes || null,
          date: new Date()
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error removing stock:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

  // Update a stock-out record
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

      // Check if stock-out record exists
      const [stockOutRecords] = await connection.query('SELECT * FROM stockout WHERE id = ?', [req.params.id]);

      if (stockOutRecords.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Stock-out record not found' });
      }

      const stockOutRecord = stockOutRecords[0];

      // Get current product quantity
      const [products] = await connection.query('SELECT quantity FROM products WHERE id = ?', [stockOutRecord.product_id]);

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Product not found' });
      }

      const product = products[0];

      // Calculate available quantity (current + old stock-out quantity)
      const availableQuantity = product.quantity + stockOutRecord.quantity;

      // Check if there's enough stock for the new quantity
      if (availableQuantity < quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Not enough stock available. Maximum available: ${availableQuantity}`
        });
      }

      // Update product quantity (add old quantity, remove new quantity)
      await connection.query(
        'UPDATE products SET quantity = quantity + ? - ? WHERE id = ?',
        [stockOutRecord.quantity, quantity, stockOutRecord.product_id]
      );

      // Update stock-out record
      await connection.query(
        'UPDATE stockout SET quantity = ?, notes = ? WHERE id = ?',
        [quantity, notes || null, req.params.id]
      );

      await connection.commit();

      res.status(200).json({
        message: 'Stock-out record updated successfully',
        stockOut: {
          id: parseInt(req.params.id),
          product_id: stockOutRecord.product_id,
          quantity,
          notes: notes || null,
          date: stockOutRecord.date
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating stock-out record:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

  // Delete a stock-out record
  router.delete('/:id', isAuthenticated, async (req, res) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if stock-out record exists
      const [stockOutRecords] = await connection.query('SELECT * FROM stockout WHERE id = ?', [req.params.id]);

      if (stockOutRecords.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Stock-out record not found' });
      }

      const stockOutRecord = stockOutRecords[0];

      // Update product quantity
      await connection.query(
        'UPDATE products SET quantity = quantity + ? WHERE id = ?',
        [stockOutRecord.quantity, stockOutRecord.product_id]
      );

      // Delete stock-out record
      await connection.query('DELETE FROM stockout WHERE id = ?', [req.params.id]);

      await connection.commit();

      res.status(200).json({ message: 'Stock-out record deleted successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting stock-out record:', error);
      res.status(500).json({ message: 'Server error' });
    } finally {
      connection.release();
    }
  });

  return router;
};
