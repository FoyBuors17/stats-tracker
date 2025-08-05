import express from "express";
import cors from "cors";
import StatsRoutes from "./src/Stats/routes.js";
import client from "./database.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection function
async function testDBConnection() {
  try {
    await client.connect();
    console.log("✅ Database connected successfully!");
    
    // Test query to verify connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log("📅 Database time:", result.rows[0].current_time);
    
    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("📋 Available tables:", tables.rows.map(row => row.table_name));
    
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Stats API Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      stats: "/api/v1/Stats"
    }
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const result = await client.query('SELECT NOW() as db_time');
    res.json({
      status: "healthy",
      database: "connected",
      server_time: new Date().toISOString(),
      db_time: result.rows[0].db_time
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message
    });
  }
});

// Stats routes
app.use("/api/v1/Stats", StatsRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Stats API: http://localhost:${PORT}/api/v1/Stats`);
  
  // Test database connection on startup
  await testDBConnection();
});



