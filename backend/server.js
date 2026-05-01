import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Schema & Models
const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  githubLink: String, // 👈 Yahan backend database me githubLink save hoga
  link: String,       // 👈 Yahan live project ka link save hoga
  technologies: [String]
});
const Project = mongoose.model('Project', ProjectSchema);

const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Securely hashed
  salt: { type: String, required: true },     // Unique salt
  token: { type: String, default: '' },       // Session token
  tokenExpiry: { type: Date },                // Session expiration
  resetOtp: { type: String, default: '' },    // OTP for password reset
  resetOtpExpiry: { type: Date }              // OTP expiry time
});
const Admin = mongoose.model('Admin', AdminSchema);

// Initialize Admin Account securely
const initAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'prarabdhankursingh2004@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';

    // Find or setup admin
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin || !admin.password) {
      if (admin) await Admin.deleteOne({ _id: admin._id }); // Reset if old invalid schema

      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto.scryptSync(adminPassword, salt, 64).toString('hex');

      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
        salt: salt
      });
      console.log('✅ Admin initialized with Encrypted Password');
    }
  } catch (err) {
    console.error('Failed to initialize admin:', err.message);
  }
};

const sampleProjects = [
  {
    title: "The Green Mart",
    description: "An eco-friendly e-commerce platform dedicated to delivering fresh, organic vegetables and premium fruits directly from farms to your doorstep.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    githubLink: "https://github.com/Hrishabh24/TheGreenMart.git",
    link: "https://your-live-website.com",
    technologies: ["Html/css", "JAVA with jsp", "mySQL", "Servlet"]
  },
  {
    title: "Smart Hostel Management",
    description: "A comprehensive digital solution for efficient hostel allocation, management, and student operations.",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    githubLink: "https://github.com/Hrishabh24/smart-hostel-management.git",
    link: "https://smart-hostel-management-rn71.vercel.app/",
    technologies: ["React", "Express", "mySQL", "Node.js", "Tailwind CSS"]
  },
  {
    title: "Aura Creative Engine",
    description: "A next-gen digital canvas integrating deep learning models for assisted design generation.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&q=80",
    githubLink: "",
    link: "",
    technologies: ["Three.js", "React", "Python", "TensorFlow"]
  }
];

mongoose.connection.once('open', async () => {
  await initAdmin();
  try {
    await Project.deleteMany({});
    await Project.insertMany(sampleProjects);
    console.log("✅ Auto-Seeded Database with latest Projects!");
  } catch (error) {
    console.error("Auto-Seed Error:", error.message);
  }
});

// Routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const adminEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials. Access Denied.' });
    }

    // Hash the input password using the stored user's salt
    const hashedInput = crypto.scryptSync(password, admin.salt, 64).toString('hex');
    const storedHashBuffer = Buffer.from(admin.password, 'hex');
    const inputHashBuffer = Buffer.from(hashedInput, 'hex');

    // Time-safe equal prevents timing attacks
    if (storedHashBuffer.length === inputHashBuffer.length && crypto.timingSafeEqual(storedHashBuffer, inputHashBuffer)) {
      // Issue session token
      const token = crypto.randomBytes(48).toString('hex');
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24); // 24-hour lifetime

      admin.token = token;
      admin.tokenExpiry = expiry;
      await admin.save();

      return res.json({ token, success: true });
    }

    return res.status(401).json({ error: 'Invalid credentials. Access Denied.' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// Email Transporter for OTP
let transporter;
const initializeTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Fallback for local testing if ENV is not set
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("⚠️ No real EMAIL_USER set in .env. Using fallback Ethereal test mailbox.");
  }
};
initializeTransporter();

// Admin Forgot Password - Send OTP Email
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const adminEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) return res.status(404).json({ error: 'Admin account not found.' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // OTP valid for 15 mins

    admin.resetOtp = otp;
    admin.resetOtpExpiry = expiry;
    await admin.save();

    const isUsingFallback = !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com';

    const mailOptions = {
      from: isUsingFallback ? '"Admin Panel Testing" <test@admin.com>' : process.env.EMAIL_USER,
      to: adminEmail,
      subject: 'Admin Dashboard - Password Reset OTP',
      text: `Your password reset OTP is: ${otp}\n\nIt will expire in 15 minutes.\nIf you did not request this, please ignore this email.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send OTP email. Make sure EMAIL_USER and EMAIL_PASS are set correctly in .env' });
      }

      if (isUsingFallback) {
        console.log(`\n===========================================`);
        console.log(`🔐 DEMO OTP GENERATED: ${otp}`);
        console.log(`✉️  Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
        console.log(`===========================================\n`);
      }

      return res.json({ success: true, message: 'OTP sent successfully.' });
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Admin Password Reset
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields required' });

    const adminEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) return res.status(404).json({ error: 'Admin account not found.' });

    if (admin.resetOtp !== otp || !admin.resetOtpExpiry || new Date() > admin.resetOtpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Enforce new password hash
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.scryptSync(newPassword, salt, 64).toString('hex');

    admin.salt = salt;
    admin.password = hashedPassword;
    admin.token = ''; // Revoke current sessions
    admin.resetOtp = ''; // Clear OTP
    admin.resetOtpExpiry = null;

    await admin.save();
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during reset' });
  }
});

app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const admin = await Admin.findOne({ token });
    if (!admin) return res.status(401).json({ error: 'Invalid token' });

    if (admin.tokenExpiry && new Date() > admin.tokenExpiry) {
      admin.token = ''; // Revoke expired token
      await admin.save();
      return res.status(401).json({ error: 'Session expired' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// Protected Messages Route
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: Missing token' });

    const admin = await Admin.findOne({ token });
    if (!admin) return res.status(401).json({ error: 'Unauthorized: Invalid token' });

    if (admin.tokenExpiry && new Date() > admin.tokenExpiry) {
      return res.status(401).json({ error: 'Unauthorized: Session expired' });
    }

    req.admin = admin; // Attach admin to request object

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication routing error' });
  }
};

// Admin Change Password (Logged In)
app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'All fields are required.' });

    const admin = req.admin;

    // Verify current password securely
    const hashedInput = crypto.scryptSync(currentPassword, admin.salt, 64).toString('hex');
    const storedHashBuffer = Buffer.from(admin.password, 'hex');
    const inputHashBuffer = Buffer.from(hashedInput, 'hex');

    if (storedHashBuffer.length !== inputHashBuffer.length || !crypto.timingSafeEqual(storedHashBuffer, inputHashBuffer)) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    // Set new password
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = crypto.scryptSync(newPassword, salt, 64).toString('hex');

    admin.salt = salt;
    admin.password = hashedPassword;
    await admin.save();

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 });
    res.json(msgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed Initial Data Route (for demo)
app.post('/api/seed', async (req, res) => {
  try {
    await Project.deleteMany({});
    await Project.insertMany(sampleProjects);
    res.json({ message: "Seeded successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
