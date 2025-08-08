// MongoDB initialization script
// This script creates the initial database and collections

// Switch to the communitrack database
db = db.getSiblingDB('communitrack');

// Create collections
db.createCollection('entries');

// Create indexes for better performance
db.entries.createIndex({ "date": -1 }); // Sort by date (newest first)
db.entries.createIndex({ "category": 1 }); // Filter by category
db.entries.createIndex({ "isImportant": 1 }); // Filter by importance
db.entries.createIndex({ "tags": 1 }); // Search by tags
db.entries.createIndex({ 
  "title": "text", 
  "description": "text", 
  "tags": "text" 
}); // Full-text search

// Create a sample entry (optional)
db.entries.insertOne({
  title: "Willkommen bei CommuniTrack",
  date: new Date(),
  description: "Dies ist Ihr erster Beispiel-Eintrag. Sie können ihn bearbeiten oder löschen und mit der Dokumentation Ihrer Kommunikation beginnen.",
  category: "sonstiges",
  tags: ["willkommen", "beispiel"],
  isImportant: false,
  attachments: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

print("CommuniTrack database initialized successfully!");
print("Collections created: entries");
print("Indexes created for optimal performance");
print("Sample entry added");
