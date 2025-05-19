const express = require('express');
const router = express.Router();

module.exports = (pool, isAuthenticated) => {
  // Get all products
  router.get('/', isAuthenticated, async (req, res) => {
    try {
      const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get a single product
  router.get('/:id', isAuthenticated, async (req, res) => {
    try {
      const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      
      if (products.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(200).json(products[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create a new product
  router.post('/', isAuthenticated, async (req, res) => {
    try {
      const { pname, quantity } = req.body;
      
      // Validate input
      if (!pname) {
        return res.status(400).json({ message: 'Product name is required' });
      }
      
      if (quantity && (isNaN(quantity) || quantity < 0)) {
        return res.status(400).json({ message: 'Quantity must be a non-negative number' });
      }
      
      // Generate product code (PXXXX format where X is a number)
      const [lastProduct] = await pool.query('SELECT pcode FROM products ORDER BY id DESC LIMIT 1');
      
      let pcode;
      if (lastProduct.length === 0) {
        pcode = 'P0001';
      } else {
        const lastCode = lastProduct[0].pcode;
        const lastNumber = parseInt(lastCode.substring(1));
        pcode = `P${String(lastNumber + 1).padStart(4, '0')}`;
      }
      
      // Insert product into database
      const [result] = await pool.query(
        'INSERT INTO products (pcode, pname, quantity) VALUES (?, ?, ?)',
        [pcode, pname, quantity || 0]
      );
      
      res.status(201).json({
        message: 'Product created successfully',
        product: {
          id: result.insertId,
          pcode,
          pname,
          quantity: quantity || 0
        }
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update a product
  router.put('/:id', isAuthenticated, async (req, res) => {
    try {
      const { pname } = req.body;
      
      // Validate input
      if (!pname) {
        return res.status(400).json({ message: 'Product name is required' });
      }
      
      // Check if product exists
      const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      
      if (products.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Update product
      await pool.query(
        'UPDATE products SET pname = ? WHERE id = ?',
        [pname, req.params.id]
      );
      
      res.status(200).json({
        message: 'Product updated successfully',
        product: {
          id: parseInt(req.params.id),
          pname,
          pcode: products[0].pcode,
          quantity: products[0].quantity
        }
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a product
  router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
      // Check if product exists
      const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
      
      if (products.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Delete product
      await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
      
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};
