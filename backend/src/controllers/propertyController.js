const dbStore = require('../storage/dbStore');

const propertyController = {
  // GET /api/properties - Get all properties with optional filters
  async getProperties(req, res) {
    try {
      const { category, search, place, stayType } = req.query;
      const properties = await dbStore.getProperties({ category, search, place, stayType });
      return res.json({
        success: true,
        count: properties.length,
        data: properties,
        mode: dbStore.isMongo() ? 'mongodb' : 'local-store'
      });
    } catch (err) {
      console.error('Error fetching properties:', err);
      return res.status(500).json({ success: false, error: 'Server Error', message: err.message });
    }
  },

  // GET /api/properties/:id - Get property by ID
  async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      const prop = await dbStore.getPropertyById(id);
      if (!prop) {
        return res.status(404).json({ success: false, error: 'Property not found' });
      }
      return res.json({ success: true, data: prop });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Server Error', message: err.message });
    }
  },

  // POST /api/properties - Onboard a new property entry
  async createProperty(req, res) {
    try {
      const {
        name,
        place,
        ownerName,
        ownerMobile,
        category,
        stayType,
        shortStayDuration,
        dailyPrice,
        longStayDuration,
        monthlyPrice,
        rent,
        deposit,
        address,
        imageUrl,
        amenities,
        categoryDetails
      } = req.body;

      // Validation
      if (!name || !place || !ownerName || !ownerMobile || !category) {
        return res.status(400).json({
          success: false,
          error: 'Missing mandatory fields: Name, Place, Owner Name, Owner Mobile No, and Category are required.'
        });
      }

      const validCategories = ['PG', 'Hostel', 'Dormitory', 'Bachelor Room'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }

      const determinedRent = rent !== undefined ? Number(rent) : (monthlyPrice || dailyPrice || 0);

      const newPropertyData = {
        name,
        place,
        ownerName,
        ownerMobile,
        category,
        stayType: stayType || 'Long Stay',
        shortStayDuration: shortStayDuration || '1-7 Days',
        dailyPrice: Number(dailyPrice || 0),
        longStayDuration: longStayDuration || '1 Month+',
        monthlyPrice: Number(monthlyPrice || 0),
        rent: determinedRent,
        deposit: Number(deposit || 0),
        address: address || '',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
        amenities: Array.isArray(amenities) ? amenities : [],
        categoryDetails: categoryDetails || {}
      };

      const createdProperty = await dbStore.createProperty(newPropertyData);
      return res.status(201).json({
        success: true,
        message: 'Property onboarded successfully!',
        data: createdProperty
      });
    } catch (err) {
      console.error('Error creating property:', err);
      return res.status(500).json({ success: false, error: 'Failed to onboard property', message: err.message });
    }
  },

  // DELETE /api/properties/:id - Remove property
  async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      const success = await dbStore.deleteProperty(id);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Property not found' });
      }
      return res.json({ success: true, message: 'Property deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete property', message: err.message });
    }
  }
};

module.exports = propertyController;
