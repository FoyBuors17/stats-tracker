import fs from 'fs';

// Create .env file with default values
const envContent = `PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Stats
DB_USER=postgres
DB_PASSWORD=P@ssw0rd!`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 You can now edit the .env file to match your database settings');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}