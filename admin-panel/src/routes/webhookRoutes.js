const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = (io) => {
  const router = express.Router();
  const envFilePath = path.resolve(__dirname, '../../../.env');

  // Middleware to ensure admin access
  const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };

  // Get all current webhook mappings
  router.get('/', requireAdmin, (req, res) => {
    const mappings = {};
    
    // Read .env file and extract webhook mappings
    try {
      const envContent = fs.readFileSync(envFilePath, 'utf8');
      const lines = envContent.split('\n');
      
      lines.forEach(line => {
        const mapMatch = line.match(/^(WEBHOOK_MAP_|WEBHOOK_MATCH_)([^=]+)=(.+)$/);
        if (mapMatch) {
          const key = mapMatch[2];
          const value = mapMatch[3];
          mappings[key] = value;
        }
      });

      res.json(mappings);
    } catch (error) {
      res.status(500).json({ error: 'Could not read webhook mappings' });
    }
  });

  // Add or update a webhook mapping
  router.post('/', requireAdmin, (req, res) => {
    const { email, webhookUrl, isCatchall } = req.body;

    try {
      // Read current .env file
      let envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Prepare the new mapping key
      const configKey = isCatchall 
        ? 'WEBHOOK_MAP_CATCHALL' 
        : `WEBHOOK_MAP_${email.replace(/\./g, '_').replace(/\+/g, '_plus_').toUpperCase()}`;

      // Check if mapping already exists
      const existingKeyRegex = new RegExp(`^${configKey}=.*$`, 'm');
      
      if (existingKeyRegex.test(envContent)) {
        // Update existing mapping
        envContent = envContent.replace(
          existingKeyRegex, 
          `${configKey}=${webhookUrl}`
        );
      } else {
        // Add new mapping
        envContent += `\n${configKey}=${webhookUrl}\n`;
      }

      // Write updated .env file
      fs.writeFileSync(envFilePath, envContent);

      // Emit update to connected clients
      io.emit('webhookMappingUpdated', { 
        email: isCatchall ? 'CATCHALL' : email, 
        webhookUrl 
      });

      res.status(200).json({ 
        message: 'Webhook mapping updated successfully',
        key: configKey 
      });
    } catch (error) {
      res.status(500).json({ error: 'Could not update webhook mapping' });
    }
  });

  // Delete a webhook mapping
  router.delete('/:key', requireAdmin, (req, res) => {
    const { key } = req.params;

    try {
      // Read current .env file
      let envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Remove the specific mapping
      const lines = envContent.split('\n');
      const filteredLines = lines.filter(line => 
        !line.startsWith(`${key}=`)
      );

      // Write updated .env file
      fs.writeFileSync(envFilePath, filteredLines.join('\n'));

      // Emit deletion to connected clients
      io.emit('webhookMappingDeleted', { key });

      res.status(200).json({ 
        message: 'Webhook mapping deleted successfully',
        key 
      });
    } catch (error) {
      res.status(500).json({ error: 'Could not delete webhook mapping' });
    }
  });

  return router;
};
