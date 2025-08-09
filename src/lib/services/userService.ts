import { getDatabase } from '@/lib/mongodb';
import { User, UserPublic, toUserPublic } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'users';

export class UserService {
  private async getCollection() {
    const db = await getDatabase();
    return db.collection<User>(COLLECTION_NAME);
  }

  async createUser(userData: {
    username: string;
    name: string;
    password: string;
  }): Promise<UserPublic | null> {
    try {
      const collection = await this.getCollection();
      
      // Check if username already exists
      const existingUser = await collection.findOne({ username: userData.username });
      if (existingUser) {
        return null; // Username already taken
      }

      // Check if this is the first user (will be admin)
      const userCount = await collection.countDocuments();
      const isFirstUser = userCount === 0;

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Generate unique ID
      const userId = new ObjectId().toString();

      const newUser: Omit<User, '_id'> = {
        id: userId,
        username: userData.username,
        name: userData.name,
        password: hashedPassword,
        role: isFirstUser ? 'admin' : 'user',
        language: 'en', // Default to English
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUser);
      
      if (result.insertedId) {
        const createdUser = await collection.findOne({ _id: result.insertedId });
        if (createdUser) {
          return toUserPublic(createdUser);
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async authenticateUser(username: string, password: string): Promise<UserPublic | null> {
    try {
      const collection = await this.getCollection();
      
      const user = await collection.findOne({ username });
      if (!user) {
        return null; // User not found
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null; // Invalid password
      }

      // Update last login time
      await collection.updateOne(
        { _id: user._id },
        { $set: { updatedAt: new Date() } }
      );

      return toUserPublic(user);
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<UserPublic | null> {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({ id: userId });
      
      if (user) {
        return toUserPublic(user);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async hasAnyUsers(): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const count = await collection.countDocuments();
      return count > 0;
    } catch (error) {
      console.error('Error checking if users exist:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<UserPublic[]> {
    try {
      const collection = await this.getCollection();
      const users = await collection.find({}).toArray();
      return users.map(toUserPublic);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async migrateUserLanguages(): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
    try {
      const collection = await this.getCollection();
      
      // Update all users that don't have a language field
      const result = await collection.updateMany(
        { language: { $exists: false } },
        { 
          $set: { 
            language: 'en', // Default to English
            updatedAt: new Date()
          }
        }
      );

      return {
        success: true,
        updatedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('Error migrating user languages:', error);
      return {
        success: false,
        error: 'Failed to migrate user language preferences'
      };
    }
  }

  async updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'username'>>): Promise<UserPublic | null> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.updateOne(
        { id: userId },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        }
      );

      if (result.matchedCount > 0) {
        const updatedUser = await collection.findOne({ id: userId });
        if (updatedUser) {
          return toUserPublic(updatedUser);
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profileData: {
    name?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    language?: 'en' | 'de';
  }): Promise<{ success: boolean; user?: UserPublic; error?: string }> {
    try {
      const collection = await this.getCollection();
      
      // Get current user
      const currentUser = await collection.findOne({ id: userId });
      if (!currentUser) {
        return { success: false, error: 'Benutzer nicht gefunden' };
      }

      // Check if username is already taken by another user
      if (profileData.username && profileData.username !== currentUser.username) {
        const existingUser = await collection.findOne({ 
          username: profileData.username,
          id: { $ne: userId }
        });
        
        if (existingUser) {
          return { success: false, error: 'Benutzername ist bereits vergeben' };
        }
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date()
      };

      if (profileData.name) {
        updateData.name = profileData.name;
      }

      if (profileData.username) {
        updateData.username = profileData.username;
      }

      if (profileData.language) {
        updateData.language = profileData.language;
      }

      // Handle password change if provided
      if (profileData.newPassword && profileData.currentPassword) {
        // Verify current password
        const isValidPassword = await bcrypt.compare(profileData.currentPassword, currentUser.password);
        if (!isValidPassword) {
          return { success: false, error: 'Aktuelles Passwort ist falsch' };
        }

        // Hash new password
        updateData.password = await bcrypt.hash(profileData.newPassword, 12);
      }

      // Update user
      const result = await collection.updateOne(
        { id: userId },
        { $set: updateData }
      );

      if (result.matchedCount > 0) {
        const updatedUser = await collection.findOne({ id: userId });
        if (updatedUser) {
          return { 
            success: true, 
            user: toUserPublic(updatedUser) 
          };
        }
      }

      return { success: false, error: 'Fehler beim Aktualisieren des Profils' };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Interner Server-Fehler' };
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ id: userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

// Singleton instance
export const userService = new UserService();
