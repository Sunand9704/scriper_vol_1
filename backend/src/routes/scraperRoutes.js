const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

// Scrape Operations
router.post('/start', scraperController.startScrape);
router.get('/status/:jobId', scraperController.getStatus);
router.post('/stop/:jobId', scraperController.stopScrape);

// Leads & Data Management
router.get('/leads', scraperController.getLeads);
router.post('/assign', scraperController.assignLeads);
router.patch('/leads/:id/status', scraperController.updateLeadStatus);
router.get('/export', scraperController.exportLeads);

// Job History, Team & Statistics
router.get('/jobs', scraperController.getJobs);
router.get('/stats', scraperController.getStats);
router.get('/team-stats', scraperController.getTeamStats);

module.exports = router;
