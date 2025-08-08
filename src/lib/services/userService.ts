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
