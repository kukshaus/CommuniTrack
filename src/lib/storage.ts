import { Entry } from '@/types';

// In-memory storage for development when MongoDB is not available
class InMemoryStorage {
  private entries: Entry[] = [];
  private nextId = 1;

  async findAll(userId?: string): Promise<Entry[]> {
    let filtered = [...this.entries];
    if (userId) {
      filtered = filtered.filter(entry => entry.userId === userId);
    }
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async findById(id: string, userId?: string): Promise<Entry | null> {
    const entry = this.entries.find(entry => entry._id === id);
    if (!entry) return null;
    if (userId && entry.userId !== userId) return null;
    return entry;
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

  async updateOne(id: string, updates: Partial<Entry>, userId?: string): Promise<Entry | null> {
    const index = this.entries.findIndex(entry => entry._id === id);
    if (index === -1) return null;
    
    const entry = this.entries[index];
    if (userId && entry.userId !== userId) return null;
    
    this.entries[index] = { ...entry, ...updates };
    return this.entries[index];
  }

  async deleteOne(id: string, userId?: string): Promise<boolean> {
    const index = this.entries.findIndex(entry => entry._id === id);
    if (index === -1) return false;
    
    const entry = this.entries[index];
    if (userId && entry.userId !== userId) return false;
    
    this.entries.splice(index, 1);
    return true;
  }

  // Add some sample data for development
  async seedData(userId: string = "demo-user") {
    // Only add demo data if no entries exist for this user
    const userEntries = this.entries.filter(entry => entry.userId === userId);
    if (userEntries.length === 0) {
      await this.insertOne({
        title: "Willkommen bei CommuniTrack",
        date: new Date(),
        description: "Dies ist Ihr erster Beispiel-Eintrag. Sie können ihn bearbeiten oder löschen und mit der Dokumentation Ihrer Kommunikation beginnen.\n\nDiese Demo läuft im In-Memory-Modus, da keine MongoDB-Verbindung verfügbar ist.",
        category: "sonstiges",
        tags: ["willkommen", "beispiel", "demo"],
        isImportant: false,
        attachments: [],
        userId: userId,
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
        userId: userId,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
    }
  }
}

// Storage interface
export interface StorageAdapter {
  findAll(userId?: string): Promise<Entry[]>;
  findById(id: string, userId?: string): Promise<Entry | null>;
  insertOne(entry: Omit<Entry, '_id'>): Promise<Entry>;
  updateOne(id: string, updates: Partial<Entry>, userId?: string): Promise<Entry | null>;
  deleteOne(id: string, userId?: string): Promise<boolean>;
}

// Global storage for Next.js serverless environment
declare global {
  // eslint-disable-next-line no-var
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
    async findAll(userId?: string) {
      try {
        const { getDatabase } = await import('./mongodb');
        const db = await getDatabase();
        const filter = userId ? { userId } : {};
        const entries = await db.collection('entries').find(filter).sort({ date: -1 }).toArray();
        return entries.map(entry => ({ ...entry, _id: entry._id.toString() })) as Entry[];
      } catch (error) {
        console.warn('MongoDB findAll failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        const storage = getGlobalStorage();
        await storage.seedData();
        return storage.findAll(userId);
      }
    },
    
    async findById(id, userId?: string) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().findById(id, userId);
        
        const { getDatabase } = await import('./mongodb');
        const { ObjectId } = await import('mongodb');
        const db = await getDatabase();
        const filter: any = { _id: new ObjectId(id) };
        if (userId) filter.userId = userId;
        const entry = await db.collection('entries').findOne(filter);
        return entry ? { ...entry, _id: entry._id.toString() } as Entry : null;
      } catch (error) {
        console.warn('MongoDB findById failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().findById(id, userId);
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
    
    async updateOne(id, updates, userId?: string) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().updateOne(id, updates, userId);
        
        const { getDatabase } = await import('./mongodb');
        const { ObjectId } = await import('mongodb');
        const db = await getDatabase();
        const filter: any = { _id: new ObjectId(id) };
        if (userId) filter.userId = userId;
        const result = await db.collection('entries').updateOne(
          filter,
          { $set: { ...updates, updatedAt: new Date() } }
        );
        
        if (result.matchedCount === 0) return null;
        
        const updatedEntry = await db.collection('entries').findOne({ _id: new ObjectId(id) });
        return updatedEntry ? { ...updatedEntry, _id: updatedEntry._id.toString() } as Entry : null;
      } catch (error) {
        console.warn('MongoDB updateOne failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().updateOne(id, updates, userId);
      }
    },
    
    async deleteOne(id, userId?: string) {
      try {
        if (useInMemoryStorage) return getGlobalStorage().deleteOne(id, userId);
        
        const { getDatabase } = await import('./mongodb');
        const { ObjectId } = await import('mongodb');
        const db = await getDatabase();
        const filter: any = { _id: new ObjectId(id) };
        if (userId) filter.userId = userId;
        const result = await db.collection('entries').deleteOne(filter);
        return result.deletedCount > 0;
      } catch (error) {
        console.warn('MongoDB deleteOne failed, switching to in-memory storage:', error instanceof Error ? error.message : 'Unknown error');
        useInMemoryStorage = true;
        return getGlobalStorage().deleteOne(id, userId);
      }
    },
  };

  return mongoAdapter;
}
