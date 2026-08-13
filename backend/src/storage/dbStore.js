const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Mongoose Schemas
const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE' },
  avatar: { type: String, default: '' }
}, { timestamps: true });

const ScrapeJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  name: { type: String, default: 'Untitled Scrape Mission' },
  source: { type: String, enum: ['GoogleMaps', 'JustDial', 'Web'], default: 'GoogleMaps' },
  query: String,
  location: String,
  landmark: String,
  depth: Number,
  status: { type: String, enum: ['started', 'running', 'completed', 'stopped', 'error'], default: 'started' },
  progress: { type: Number, default: 0 },
  statusMessage: { type: String, default: 'Initialized' },
  resultCount: { type: Number, default: 0 },
  error: String
}, { timestamps: true });

const ScrapedLeadSchema = new mongoose.Schema({
  jobId: { type: String, required: true, index: true },
  source: { type: String, enum: ['GoogleMaps', 'JustDial', 'Web'], required: true },
  businessName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, default: '' },
  website: { type: String, default: '' },
  hasWebsite: { type: Boolean, default: false },
  address: { type: String, default: '' },
  rating: { type: String, default: '' },
  reviewsCount: { type: Number, default: 0 },
  category: { type: String, default: '' },
  city: { type: String, default: '' },
  landmark: { type: String, default: '' },
  latitude: Number,
  longitude: Number,
  // Direct Google Maps deep-link for this business location
  mapsUrl: { type: String, default: '' },
  scrapedAt: { type: Date, default: Date.now },
  assignedTo: {
    userId: { type: String, default: null },
    name: { type: String, default: null },
    email: { type: String, default: null }
  },
  assignedAt: Date,
  leadStatus: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'CALLBACK', 'CLOSED_WON', 'CLOSED_LOST'],
    default: 'NEW'
  },
  notes: [{
    id: String,
    text: String,
    authorName: String,
    createdAt: { type: Date, default: Date.now }
  }],
  lastActivityAt: Date
}, { timestamps: true });

let UserModel;
let ScrapeJobModel;
let ScrapedLeadModel;

let isMongoConnected = false;
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Pre-hashed default password hashes
const ADMIN_HASH = bcrypt.hashSync('admin123', 10);
const EMPLOYEE_HASH = bcrypt.hashSync('employee123', 10);

const DEFAULT_USERS = [
  {
    userId: 'user_admin_01',
    name: 'Admin Manager',
    email: 'admin@scriper.com',
    password: ADMIN_HASH,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    userId: 'user_emp_01',
    name: 'John Doe',
    email: 'john@scriper.com',
    password: EMPLOYEE_HASH,
    role: 'EMPLOYEE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    userId: 'user_emp_02',
    name: 'Sarah Connor',
    email: 'sarah@scriper.com',
    password: EMPLOYEE_HASH,
    role: 'EMPLOYEE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
  }
];

let localUsers = [];
let localJobs = [];
let localLeads = [];

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Users File
  if (fs.existsSync(USERS_FILE)) {
    try {
      localUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (localUsers.length === 0) localUsers = [...DEFAULT_USERS];
    } catch (e) { localUsers = [...DEFAULT_USERS]; }
  } else {
    localUsers = [...DEFAULT_USERS];
    fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2), 'utf8');
  }

  // Jobs File
  if (fs.existsSync(JOBS_FILE)) {
    try { localJobs = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8')); } catch (e) { localJobs = []; }
  } else {
    fs.writeFileSync(JOBS_FILE, '[]', 'utf8');
  }

  // Leads File
  if (fs.existsSync(LEADS_FILE)) {
    try { localLeads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch (e) { localLeads = []; }
  } else {
    fs.writeFileSync(LEADS_FILE, '[]', 'utf8');
  }
}

function saveLocalData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(localUsers, null, 2), 'utf8');
    fs.writeFileSync(JOBS_FILE, JSON.stringify(localJobs, null, 2), 'utf8');
    fs.writeFileSync(LEADS_FILE, JSON.stringify(localLeads, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local data fallback:', e.message);
  }
}

async function initDb(mongoUri) {
  ensureDataFiles();
  if (mongoUri && !mongoUri.includes('<db_password>')) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      isMongoConnected = true;
      console.log('✅ Connected to MongoDB database successfully!');
      UserModel = mongoose.model('User', UserSchema);
      ScrapeJobModel = mongoose.model('ScrapeJob', ScrapeJobSchema);
      ScrapedLeadModel = mongoose.model('ScrapedLead', ScrapedLeadSchema);

      // Seed default users in Mongo if empty
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(DEFAULT_USERS);
        console.log('🌱 Seeded default users in MongoDB database.');
      }
      return;
    } catch (err) {
      console.warn(`⚠️ MongoDB connection warning: ${err.message}. Using local JSON database storage fallback.`);
    }
  } else {
    console.log('ℹ️ Local JSON storage mode initialized.');
  }
  isMongoConnected = false;
}

const dbStore = {
  initDb,
  isMongo: () => isMongoConnected,

  // User Auth Methods
  async registerUser({ name, email, password, role = 'EMPLOYEE' }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: role || 'EMPLOYEE',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    };

    if (isMongoConnected) {
      return await UserModel.create(newUser);
    } else {
      localUsers.push(newUser);
      saveLocalData();
      return newUser;
    }
  },

  async authenticateUser(email, plainPassword) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.findUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isValid = bcrypt.compareSync(plainPassword, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async findUserByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isMongoConnected) {
      return await UserModel.findOne({ email: cleanEmail }).lean();
    } else {
      return localUsers.find(u => u.email.toLowerCase() === cleanEmail) || null;
    }
  },

  async findUserById(userId) {
    if (isMongoConnected) {
      const user = await UserModel.findOne({ userId }).lean();
      if (user) {
        const { password, ...u } = user;
        return u;
      }
      return null;
    } else {
      const user = localUsers.find(u => u.userId === userId);
      if (user) {
        const { password, ...u } = user;
        return u;
      }
      return null;
    }
  },

  async getUsers() {
    if (isMongoConnected) {
      return await UserModel.find({}, '-password').lean();
    } else {
      return localUsers.map(({ password, ...u }) => u);
    }
  },

  async createUser(userData) {
    return await this.registerUser(userData);
  },

  // Jobs methods
  async createJob(jobData) {
    const now = new Date().toISOString();
    const fullJob = {
      jobId: jobData.jobId,
      name: jobData.name || 'Scrape Mission',
      source: jobData.source || 'GoogleMaps',
      query: jobData.query || '',
      location: jobData.location || '',
      landmark: jobData.landmark || '',
      depth: jobData.depth || 10,
      status: jobData.status || 'started',
      progress: jobData.progress || 0,
      statusMessage: jobData.statusMessage || 'Job started',
      resultCount: jobData.resultCount || 0,
      createdAt: now,
      updatedAt: now
    };

    if (isMongoConnected) {
      return await ScrapeJobModel.create(fullJob);
    } else {
      localJobs.unshift(fullJob);
      saveLocalData();
      return fullJob;
    }
  },

  async updateJob(jobId, updates) {
    if (isMongoConnected) {
      return await ScrapeJobModel.findOneAndUpdate({ jobId }, updates, { new: true });
    } else {
      const idx = localJobs.findIndex(j => j.jobId === jobId);
      if (idx !== -1) {
        localJobs[idx] = { ...localJobs[idx], ...updates, updatedAt: new Date().toISOString() };
        saveLocalData();
        return localJobs[idx];
      }
      return null;
    }
  },

  async getJob(jobId) {
    if (isMongoConnected) {
      return await ScrapeJobModel.findOne({ jobId }).lean();
    } else {
      return localJobs.find(j => j.jobId === jobId) || null;
    }
  },

  async getJobs() {
    if (isMongoConnected) {
      return await ScrapeJobModel.find().sort({ createdAt: -1 }).lean();
    } else {
      return localJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  // Leads methods
  async saveLeads(leadsArray) {
    if (!leadsArray || leadsArray.length === 0) return [];
    if (isMongoConnected) {
      return await ScrapedLeadModel.insertMany(leadsArray);
    } else {
      const formatted = leadsArray.map(lead => ({
        ...lead,
        _id: lead._id || 'lead_' + Math.random().toString(36).substr(2, 9),
        assignedTo: lead.assignedTo || { userId: null, name: null, email: null },
        leadStatus: lead.leadStatus || 'NEW',
        notes: lead.notes || [],
        scrapedAt: lead.scrapedAt || new Date().toISOString()
      }));
      localLeads.unshift(...formatted);
      saveLocalData();
      return formatted;
    }
  },

  async getLeads(filters = {}) {
    let results = [];
    if (isMongoConnected) {
      let query = {};
      if (filters.jobId) query.jobId = filters.jobId;
      if (filters.source && filters.source !== 'ALL') query.source = filters.source;
      if (filters.hasPhone === 'true') query.phone = { $ne: '' };
      if (filters.hasWebsite === 'true') query.hasWebsite = true;
      if (filters.assignedUserId) query['assignedTo.userId'] = filters.assignedUserId;
      if (filters.leadStatus && filters.leadStatus !== 'ALL') query.leadStatus = filters.leadStatus;
      if (filters.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [
          { businessName: regex },
          { city: regex },
          { category: regex },
          { phone: regex },
          { email: regex },
          { address: regex },
          { landmark: regex }
        ];
      }
      results = await ScrapedLeadModel.find(query).sort({ scrapedAt: -1 }).lean();
    } else {
      results = [...localLeads];
      if (filters.jobId) results = results.filter(l => l.jobId === filters.jobId);
      if (filters.source && filters.source !== 'ALL') results = results.filter(l => l.source === filters.source);
      if (filters.hasPhone === 'true') results = results.filter(l => l.phone && l.phone.trim().length > 0);
      if (filters.hasWebsite === 'true') results = results.filter(l => l.hasWebsite || (l.website && l.website.length > 0));
      if (filters.assignedUserId) results = results.filter(l => l.assignedTo && l.assignedTo.userId === filters.assignedUserId);
      if (filters.leadStatus && filters.leadStatus !== 'ALL') results = results.filter(l => l.leadStatus === filters.leadStatus);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        results = results.filter(l => 
          (l.businessName && l.businessName.toLowerCase().includes(s)) ||
          (l.city && l.city.toLowerCase().includes(s)) ||
          (l.category && l.category.toLowerCase().includes(s)) ||
          (l.phone && l.phone.includes(s)) ||
          (l.email && l.email.toLowerCase().includes(s)) ||
          (l.address && l.address.toLowerCase().includes(s)) ||
          (l.landmark && l.landmark.toLowerCase().includes(s))
        );
      }
    }
    return results;
  },

  async assignLeads(leadIds, userObj) {
    const now = new Date().toISOString();
    const assignedPayload = {
      userId: userObj.userId,
      name: userObj.name,
      email: userObj.email
    };

    if (isMongoConnected) {
      await ScrapedLeadModel.updateMany(
        { _id: { $in: leadIds } },
        { $set: { assignedTo: assignedPayload, assignedAt: now } }
      );
      return true;
    } else {
      localLeads.forEach(l => {
        if (leadIds.includes(l._id)) {
          l.assignedTo = assignedPayload;
          l.assignedAt = now;
        }
      });
      saveLocalData();
      return true;
    }
  },

  async updateLeadStatus(leadId, status, noteText = '', authorName = 'User') {
    const now = new Date().toISOString();
    const newNote = noteText ? {
      id: 'note_' + Math.random().toString(36).substr(2, 9),
      text: noteText,
      authorName,
      createdAt: now
    } : null;

    if (isMongoConnected) {
      const updateObj = { leadStatus: status, lastActivityAt: now };
      if (newNote) {
        await ScrapedLeadModel.findByIdAndUpdate(leadId, {
          $set: updateObj,
          $push: { notes: newNote }
        });
      } else {
        await ScrapedLeadModel.findByIdAndUpdate(leadId, { $set: updateObj });
      }
      return true;
    } else {
      const lead = localLeads.find(l => l._id === leadId);
      if (lead) {
        lead.leadStatus = status;
        lead.lastActivityAt = now;
        if (!lead.notes) lead.notes = [];
        if (newNote) lead.notes.unshift(newNote);
        saveLocalData();
      }
      return true;
    }
  },

  async getStats() {
    let leads = [];
    let jobs = [];
    if (isMongoConnected) {
      leads = await ScrapedLeadModel.find().lean();
      jobs = await ScrapeJobModel.find().lean();
    } else {
      leads = localLeads;
      jobs = localJobs;
    }

    const totalLeads = leads.length;
    const withPhoneCount = leads.filter(l => l.phone && l.phone.trim().length > 0).length;
    const withWebsiteCount = leads.filter(l => l.hasWebsite || (l.website && l.website.trim().length > 0)).length;
    const withEmailCount = leads.filter(l => l.email && l.email.trim().length > 0).length;
    const assignedLeadsCount = leads.filter(l => l.assignedTo && l.assignedTo.userId).length;
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;

    return {
      totalLeads,
      withPhoneCount,
      phonePercentage: totalLeads > 0 ? Math.round((withPhoneCount / totalLeads) * 100) : 0,
      withWebsiteCount,
      websitePercentage: totalLeads > 0 ? Math.round((withWebsiteCount / totalLeads) * 100) : 0,
      withEmailCount,
      assignedLeadsCount,
      totalJobs,
      completedJobs
    };
  },

  async getTeamStats() {
    let users = [];
    let leads = [];
    if (isMongoConnected) {
      users = await UserModel.find({ role: 'EMPLOYEE' }, '-password').lean();
      leads = await ScrapedLeadModel.find().lean();
    } else {
      users = localUsers.filter(u => u.role === 'EMPLOYEE').map(({ password, ...u }) => u);
      leads = localLeads;
    }

    const teamBreakdown = users.map(user => {
      const userLeads = leads.filter(l => l.assignedTo && l.assignedTo.userId === user.userId);
      const totalAssigned = userLeads.length;
      const contacted = userLeads.filter(l => l.leadStatus === 'CONTACTED').length;
      const qualified = userLeads.filter(l => l.leadStatus === 'QUALIFIED').length;
      const won = userLeads.filter(l => l.leadStatus === 'CLOSED_WON').length;
      const lost = userLeads.filter(l => l.leadStatus === 'CLOSED_LOST').length;

      return {
        user,
        totalAssigned,
        contacted,
        qualified,
        won,
        lost,
        conversionRate: totalAssigned > 0 ? Math.round((won / totalAssigned) * 100) : 0
      };
    });

    const unassignedCount = leads.filter(l => !l.assignedTo || !l.assignedTo.userId).length;

    return {
      teamBreakdown,
      unassignedCount,
      totalLeads: leads.length
    };
  }
};

module.exports = dbStore;
