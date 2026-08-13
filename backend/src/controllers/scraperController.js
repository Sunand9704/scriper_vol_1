const { v4: uuidv4 } = require('uuid');
const playwrightScraper = require('../services/playwrightScraper');
const dbStore = require('../storage/dbStore');

const scraperController = {
  // Start a new scrape job
  async startScrape(req, res) {
    try {
      const { query, location, landmark = '', source = 'GoogleMaps', depth = 15 } = req.body;

      if (!query || !location) {
        return res.status(400).json({
          success: false,
          error: 'Both "query" and "location" are required parameters.'
        });
      }

      const cleanLandmark = (landmark || '').trim();

      const jobId = 'job_' + uuidv4().substring(0, 8);
      const name = cleanLandmark
        ? `${query} near ${cleanLandmark}, ${location} (${source})`
        : `${query} in ${location} (${source})`;

      // Create record in database
      const newJob = await dbStore.createJob({
        jobId,
        name,
        source,
        query,
        location,
        landmark: cleanLandmark,
        depth: parseInt(depth, 10) || 15,
        status: 'started',
        progress: 0,
        statusMessage: 'Task queued...'
      });

      // Start asynchronous browser scraping process
      playwrightScraper.startScrapeJob(jobId, { query, location, landmark: cleanLandmark, source, depth });

      return res.json({
        success: true,
        message: 'Scrape mission started successfully!',
        data: {
          jobId,
          name,
          source,
          query,
          location,
          landmark: cleanLandmark,
          depth
        }
      });
    } catch (error) {
      console.error('[scraperController.startScrape Error]:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get real-time status of a job
  async getStatus(req, res) {
    try {
      const { jobId } = req.params;
      const memStatus = playwrightScraper.getJobStatus(jobId);
      const dbJob = await dbStore.getJob(jobId);

      if (!dbJob && !memStatus) {
        return res.status(404).json({ success: false, error: 'Job not found' });
      }

      const statusData = {
        jobId,
        name: dbJob ? dbJob.name : 'Scrape Mission',
        status: memStatus ? (memStatus.stopped ? 'stopped' : (dbJob ? dbJob.status : 'running')) : (dbJob ? dbJob.status : 'completed'),
        progress: memStatus ? memStatus.progress : (dbJob ? dbJob.progress : 100),
        statusMessage: memStatus ? memStatus.statusMessage : (dbJob ? dbJob.statusMessage : 'Completed'),
        resultCount: memStatus ? memStatus.scrapedCount : (dbJob ? dbJob.resultCount : 0)
      };

      return res.json({ success: true, data: statusData });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Stop active scrape job
  async stopScrape(req, res) {
    try {
      const { jobId } = req.params;
      await playwrightScraper.stopJob(jobId);
      return res.json({ success: true, message: `Job ${jobId} stop request submitted` });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get scraped leads table with search & filtering
  async getLeads(req, res) {
    try {
      const { jobId, source, hasPhone, hasWebsite, assignedUserId, leadStatus, search } = req.query;
      const leads = await dbStore.getLeads({ jobId, source, hasPhone, hasWebsite, assignedUserId, leadStatus, search });

      return res.json({
        success: true,
        count: leads.length,
        data: leads
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Assign leads to employee
  async assignLeads(req, res) {
    try {
      const { leadIds, userObj } = req.body;
      if (!leadIds || !Array.isArray(leadIds) || !userObj || !userObj.userId) {
        return res.status(400).json({ success: false, error: 'Missing leadIds array or userObj object.' });
      }

      await dbStore.assignLeads(leadIds, userObj);
      return res.json({
        success: true,
        message: `Successfully assigned ${leadIds.length} lead(s) to ${userObj.name}.`
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update lead status and notes (Employee action)
  async updateLeadStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, noteText, authorName } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required.' });
      }

      await dbStore.updateLeadStatus(id, status, noteText, authorName);
      return res.json({ success: true, message: 'Lead status & notes updated successfully.' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get team stats & breakdown for Admin
  async getTeamStats(req, res) {
    try {
      const teamStats = await dbStore.getTeamStats();
      return res.json({ success: true, data: teamStats });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get history of all scrape jobs
  async getJobs(req, res) {
    try {
      const jobs = await dbStore.getJobs();
      return res.json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get summary dashboard statistics
  async getStats(req, res) {
    try {
      const stats = await dbStore.getStats();
      return res.json({ success: true, data: stats });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  // Export leads to CSV or JSON format
  async exportLeads(req, res) {
    try {
      const { format = 'csv', source, hasPhone, hasWebsite, assignedUserId, leadStatus, search } = req.query;
      const leads = await dbStore.getLeads({ source, hasPhone, hasWebsite, assignedUserId, leadStatus, search });

      if (format.toLowerCase() === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=scraped_leads.json');
        return res.send(JSON.stringify(leads, null, 2));
      }

      // Generate CSV
      const headers = ['Business Name', 'Phone', 'Email', 'Website', 'Has Website', 'Address', 'Rating', 'Reviews', 'Category', 'City', 'Landmark / Area', 'Google Maps Link', 'Assigned Employee', 'Lead Status', 'Source', 'Scraped At'];
      const csvRows = [headers.join(',')];

      leads.forEach(l => {
        const row = [
          `"${(l.businessName || '').replace(/"/g, '""')}"`,
          `"${(l.phone || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.website || '').replace(/"/g, '""')}"`,
          l.hasWebsite ? 'TRUE' : 'FALSE',
          `"${(l.address || '').replace(/"/g, '""')}"`,
          `"${l.rating || ''}"`,
          l.reviewsCount || 0,
          `"${(l.category || '').replace(/"/g, '""')}"`,
          `"${(l.city || '').replace(/"/g, '""')}"`,
          `"${(l.landmark || '').replace(/"/g, '""')}"`,
          `"${(l.mapsUrl || '').replace(/"/g, '""')}"`,
          `"${l.assignedTo?.name || 'Unassigned'}"`,
          `"${l.leadStatus || 'NEW'}"`,
          `"${l.source || ''}"`,
          `"${l.scrapedAt || ''}"`
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=scraped_leads.csv');
      return res.send(csvContent);

    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = scraperController;
