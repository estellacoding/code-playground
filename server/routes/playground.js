const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('../config/database');
const router = express.Router();

const requireAuth = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM playgrounds WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playgrounds' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, language, code, description } = req.body;
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO playgrounds (user_id, title, language, code, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title || 'Untitled', language, code || '', description || '']
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playground' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, u.name as author_name FROM playgrounds p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Playground not found' });
    }

    const playground = rows[0];
    
    if (!playground.is_public && (!req.user || req.user.id !== playground.user_id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(playground);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playground' });
  }
});

router.get('/share/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT p.*, u.name as author_name FROM playgrounds p JOIN users u ON p.user_id = u.id WHERE p.share_token = $1',
      [req.params.token]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shared playground not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared playground' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { title, code, description, is_public } = req.body;
  
  try {
    const { rows } = await pool.query(
      'UPDATE playgrounds SET title = $1, code = $2, description = $3, is_public = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, code, description, is_public, req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Playground not found or access denied' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update playground' });
  }
});

router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const shareToken = crypto.randomBytes(32).toString('hex');
    
    const { rows } = await pool.query(
      'UPDATE playgrounds SET share_token = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [shareToken, req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Playground not found or access denied' });
    }

    res.json({ share_token: shareToken, share_url: `${process.env.CLIENT_URL}/share/${shareToken}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate share link' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM playgrounds WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Playground not found or access denied' });
    }

    res.json({ message: 'Playground deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete playground' });
  }
});

module.exports = router;