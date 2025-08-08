import { Entry } from '@/types';

// In-memory storage for development when MongoDB is not available
class InMemoryStorage {
  private entries: Entry[] = [];
  private nextId = 1;

  async findAll(): Promise<Entry[]> {
    return [...this.entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async findById(id: string): Promise<Entry | null> {
    return this.entries.find(entry => entry._id === id) || null;
  }

  async insertOne(entry: Omit<Entry, '_id'>): Promise<Entry> {
    const newEntry: Entry = {
      ...entry,
      _id: this.nextId.toString(),
    };
    this.nextId++;
    this.entries.push(newEntry);
    return newEntry;
  }

  async updateOne(id: string, updates: Partial<Entry>): Promise<Entry | null> {
    const index = this.entries.findIndex(entry => entry._id === id);
    if (index === -1) return null;
    
    this.entries[index] = { ...this.entries[index], ...updates };
    return this.entries[index];
  }

  async deleteOne(id: string): Promise<boolean> {
    const index = this.entries.findIndex(entry => entry._id === id);
    if (index === -1) return false;
    
    this.entries.splice(index, 1);
    return true;
  }

  // Add some sample data for development
  async seedData() {
    if (this.entries.length === 0) {
      await this.insertOne({
        title: "Willkommen bei CommuniTrack",
        date: new Date(),
        description: "Dies ist Ihr erster Beispiel-Eintrag. Sie können ihn bearbeiten oder löschen und mit der Dokumentation Ihrer Kommunikation beginnen.\n\nDiese Demo läuft im In-Memory-Modus, da keine MongoDB-Verbindung verfügbar ist.",
        category: "sonstiges",
        tags: ["willkommen", "beispiel", "demo"],
        isImportant: false,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.insertOne({
        title: "Beispiel-Konflikt",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        description: "Dies ist ein Beispiel für einen Konflikt-Eintrag. Hier können Sie wichtige Ereignisse dokumentieren.",
        category: "konflikt",
        tags: ["wichtig", "dokumentation"],
        isImportant: true,
        attachments: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
    }
  }
}

// Storage interface
export interface StorageAdapter {
  findAll(): Promise<Entry[]>;
  findById(id: string): Promise<Entry | null>;
  insertOne(entry: Omit<Entry, '_id'>): Promise<Entry>;
  updateOne(id: string, updates: Partial<Entry>): Promise<Entry | null>;
  deleteOne(id: string): Promise<boolean>;
}

// Global storage for Next.js serverless environment
declare global {
  var globalStorage: InMemoryStorage | undefined;
}

// Global in-memory storage instance with proper singleton pattern for Next.js
function getGlobalStorage(): InMemoryStorage {
  if (!global.globalStorage) {
    global.globalStorage = new InMemoryStorage();
  }
  return global.globalStorage;
}

// Global flag to track if we should use MongoDB or in-memory storage
let useInMemoryStorage = false;
let storageInitialized = false;

// Get storage adapter based on environment
export async function getStorage(): Promise<StorageAdapter> {
  // Check if MongoDB URI is configured
  if (!process.env.MONGODB_URI || useInMemoryStorage) {
    if (!storageInitialized) {
      console.log('Using in-memory storage for development (MongoDB not configured)');
      storageInitialized = true;
    }
    useInMemoryStorage = true;
    const storage = getGlobalStorage();
    await storage.seedData();
    return storage;
  }

  // Create MongoDB adapter with error handling for each operation
  const mongoAdapter: StorageAdapter = {
    async findAll() {
      try {
        const { getDatabase } = await import('./mongodb');
        const db = await getDatabase();
        const entries = await db.collection('entries').find({}).sort({ date: -1 }).toArray();
        return entries.map(entry => ({ ...entry, _id: entry._id.toString() })) as Entry[];
      } catch (error) {
        console.warn('MongoDB findAll failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        const storage = getGlobalStorage();
        await storage.seedData();
        return storage.findAll();
      }
    },
    
    async findById(id) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().findById(id);
        
        const { getDatabase } = await import('./mongodb');
        const { ObjectId } = await import('mongodb');
        const db = await getDatabase();
        const entry = await db.collection('entries').findOne({ _id: new ObjectId(id) });
        return entry ? { ...entry, _id: entry._id.toString() } as Entry : null;
      } catch (error) {
        console.warn('MongoDB findById failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().findById(id);
      }
    },
    
    async insertOne(entry) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().insertOne(entry);
        
        const { getDatabase } = await import('./mongodb');
        const db = await getDatabase();
        const result = await db.collection('entries').insertOne(entry);
        const newEntry = await db.collection('entries').findOne({ _id: result.insertedId });
        if (!newEntry) throw new Error('Failed to retrieve inserted entry');
        return { ...newEntry, _id: newEntry._id.toString() } as Entry;
      } catch (error) {
        console.warn('MongoDB insertOne failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().insertOne(entry);
      }
    },
    
    async updateOne(id, updates) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().updateOne(id, updates);
        
        const { getDatabase } = await import('./mongodb');
        const { ObjectId } = await import('mongodb');
        const db = await getDatabase();
        const result = await db.collection('entries').updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...updates, updatedAt: new Date() } }
        );
        
        if (result.matchedCount === 0) return null;
        
        const updatedEntry = await db.collection('entries').findOne({ _id: new ObjectId(id) });
        return updatedEntry ? { ...updatedEntry, _id: updatedEntry._id.toString() } as Entry : null;
      } catch (error) {
        console.warn('MongoDB updateOne failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().updateOne(id, updates);
      }
    },
    
    async deleteOne(id) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().deleteOne(id);
        
        const { getDatabase } = await import('./mongodb');
        const { ObjectId } = await import('mongodb');
        const db = await getDatabase();
        const result = await db.collection('entries').deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
      } catch (error) {
        console.warn('MongoDB deleteOne failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().deleteOne(id);
      }
    },
  };

  return mongoAdapter;
}
