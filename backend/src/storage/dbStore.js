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
  latitude: Number,
  longitude: Number,
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

// Accommodation Onboarding Property Schema
const PropertySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  place: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  ownerMobile: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['PG', 'Hostel', 'Dormitory', 'Bachelor Room'] },
  stayType: { type: String, default: 'Long Stay', enum: ['Short Stay', 'Long Stay', 'Both Short & Long Stay'] },
  shortStayDuration: { type: String, default: '1-7 Days' },
  dailyPrice: { type: Number, default: 0 },
  longStayDuration: { type: String, default: '1 Month+' },
  monthlyPrice: { type: Number, default: 0 },
  rent: { type: Number, required: true, default: 0 },
  deposit: { type: Number, default: 0 },
  address: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  amenities: { type: [String], default: [] },
  categoryDetails: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

let UserModel;
let ScrapeJobModel;
let ScrapedLeadModel;
let PropertyModel;

let isMongoConnected = false;
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

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

// Pre-seeded sample onboarding properties
const DEFAULT_PROPERTIES = [
  {
    _id: "66b1a1a1a1a1a1a1a1a1a001",
    name: "Starlight Premium PG for Men",
    place: "Koramangala 5th Block, Bangalore",
    ownerName: "Rajesh Kumar",
    ownerMobile: "+91 98765 43210",
    category: "PG",
    stayType: "Both Short & Long Stay",
    shortStayDuration: "1-7 Days",
    dailyPrice: 450,
    longStayDuration: "1 Month+",
    monthlyPrice: 9500,
    rent: 9500,
    deposit: 15000,
    address: "No. 42, 1st Cross, Near Jyoti Nivas College Road, Koramangala",
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    amenities: ["WiFi", "AC", "Food", "TV", "Housekeeping", "Power Backup", "RO Water", "Washing Machine"],
    categoryDetails: {
      foodIncluded: true,
      foodType: "Both (Veg & Non-Veg)",
      sharingTypes: ["Single", "2 Sharing", "3 Sharing"],
      acAvailable: true,
      curfewTime: "10:30 PM",
      housekeeping: true
    },
    createdAt: new Date("2026-08-01").toISOString()
  },
  {
    _id: "66b1a1a1a1a1a1a1a1a1a002",
    name: "Apex Luxury Girls Hostel & Residency",
    place: "HSR Layout Sector 2, Bangalore",
    ownerName: "Anita Sharma",
    ownerMobile: "+91 91234 56789",
    category: "Hostel",
    stayType: "Long Stay",
    shortStayDuration: "1-7 Days",
    dailyPrice: 600,
    longStayDuration: "1 Month+",
    monthlyPrice: 11000,
    rent: 11000,
    deposit: 20000,
    address: "Plot 88, 27th Main Rd, Sector 2, HSR Layout",
    imageUrl: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    amenities: ["WiFi", "CCTV Security", "Warden On-site", "Mess Canteen", "Study Room", "Biometric Lock", "RO Water"],
    categoryDetails: {
      hostelType: "Girls Hostel",
      roomTypes: ["Double Sharing", "Triple Sharing"],
      canteenFacility: true,
      wardenContact: "+91 91234 56799",
      securityCCTV: true,
      studyRoom: true
    },
    createdAt: new Date("2026-08-03").toISOString()
  },
  {
    _id: "66b1a1a1a1a1a1a1a1a1a003",
    name: "Backpackers Pod & Dormitory",
    place: "Indiranagar 100ft Road, Bangalore",
    ownerName: "Vikram Malhotra",
    ownerMobile: "+91 99887 76655",
    category: "Dormitory",
    stayType: "Short Stay",
    shortStayDuration: "1 Day",
    dailyPrice: 450,
    longStayDuration: "1 Month+",
    monthlyPrice: 9000,
    rent: 450,
    deposit: 500,
    address: "12A, 100 Feet Rd, Opposite Metro Station, Indiranagar",
    imageUrl: "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?auto=format&fit=crop&w=800&q=80",
    amenities: ["WiFi", "Personal Lockers", "AC", "24/7 Washroom", "Keycard Access", "Lounge"],
    categoryDetails: {
      totalBeds: 24,
      rateType: "Daily Rate",
      bedType: "Bunk Bed Pod",
      lockersAvailable: true,
      washroomsCount: 6,
      checkInTime: "12:00 PM (24/7 Access)"
    },
    createdAt: new Date("2026-08-05").toISOString()
  },
  {
    _id: "66b1a1a1a1a1a1a1a1a1a004",
    name: "Urban Nest 1BHK Bachelor Studio",
    place: "BTM Layout 2nd Stage, Bangalore",
    ownerName: "Suresh Reddy",
    ownerMobile: "+91 97654 32109",
    category: "Bachelor Room",
    stayType: "Long Stay",
    shortStayDuration: "1-7 Days",
    dailyPrice: 800,
    longStayDuration: "1 Month+",
    monthlyPrice: 14000,
    rent: 14000,
    deposit: 30000,
    address: "House 304, 7th Main, BTM 2nd Stage",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    amenities: ["Kitchen Setup", "Balcony", "24/7 Water", "Covered Parking", "Power Backup"],
    categoryDetails: {
      roomType: "1 BHK Independent",
      furnishing: "Semi-Furnished",
      allowedTenants: "Bachelors Male / Female",
      kitchenAvailable: true,
      waterSupply: "24 Hours Borewell & Kaveri"
    },
    createdAt: new Date("2026-08-08").toISOString()
  }
];

let localUsers = [];
let localJobs = [];
let localLeads = [];
let localProperties = [];

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

  // Properties File
  if (fs.existsSync(PROPERTIES_FILE)) {
    try {
      localProperties = JSON.parse(fs.readFileSync(PROPERTIES_FILE, 'utf8'));
      if (localProperties.length === 0) localProperties = [...DEFAULT_PROPERTIES];
    } catch (e) { localProperties = [...DEFAULT_PROPERTIES]; }
  } else {
    localProperties = [...DEFAULT_PROPERTIES];
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(localProperties, null, 2), 'utf8');
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
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(localProperties, null, 2), 'utf8');
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
      PropertyModel = mongoose.model('Property', PropertySchema);

      // Seed default users in Mongo if empty
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        await UserModel.insertMany(DEFAULT_USERS);
        console.log('🌱 Seeded default users in MongoDB database.');
      }

      // Seed default properties in Mongo if empty
      const propCount = await PropertyModel.countDocuments();
      if (propCount === 0) {
        await PropertyModel.insertMany(DEFAULT_PROPERTIES);
        console.log('🌱 Seeded default onboarding properties in MongoDB database.');
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

  // Accommodation Onboarding Property Methods
  async getProperties(filters = {}) {
    let results = [];
    const { category, search, place, stayType } = filters;

    if (isMongoConnected) {
      let query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (stayType && stayType !== 'All') {
        query.stayType = { $regex: stayType, $options: 'i' };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { place: { $regex: search, $options: 'i' } },
          { ownerName: { $regex: search, $options: 'i' } }
        ];
      }
      if (place) {
        query.place = { $regex: place, $options: 'i' };
      }
      results = await PropertyModel.find(query).sort({ createdAt: -1 }).lean();
    } else {
      results = [...localProperties];
      if (category && category !== 'All') {
        results = results.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
      }
      if (stayType && stayType !== 'All') {
        results = results.filter(p => p.stayType && p.stayType.toLowerCase().includes(stayType.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.place && p.place.toLowerCase().includes(q)) ||
          (p.ownerName && p.ownerName.toLowerCase().includes(q))
        );
      }
      if (place) {
        results = results.filter(p => p.place && p.place.toLowerCase().includes(place.toLowerCase()));
      }
    }
    return results;
  },

  async getPropertyById(id) {
    if (isMongoConnected) {
      return await PropertyModel.findById(id).lean();
    } else {
      return localProperties.find(p => p._id === id) || null;
    }
  },

  async createProperty(propertyData) {
    if (isMongoConnected) {
      return await PropertyModel.create(propertyData);
    } else {
      const createdItem = {
        _id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        ...propertyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localProperties.unshift(createdItem);
      saveLocalData();
      return createdItem;
    }
  },

  async deleteProperty(id) {
    if (isMongoConnected) {
      const prop = await PropertyModel.findByIdAndDelete(id);
      return Boolean(prop);
    } else {
      const idx = localProperties.findIndex(p => p._id === id);
      if (idx !== -1) {
        localProperties.splice(idx, 1);
        saveLocalData();
        return true;
      }
      return false;
    }
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
          { address: regex }
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
          (l.address && l.address.toLowerCase().includes(s))
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
