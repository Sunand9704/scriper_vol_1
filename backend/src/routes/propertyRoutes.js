const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', propertyController.createProperty);
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;
