import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { models } from './models';
import { seedExerciseTypes } from './seed';

// Create the adapter
// JSI disabled for Expo Go compatibility - use development build for JSI
const adapter = new SQLiteAdapter({
  schema,
  jsi: false,
  // Migration handling (for future schema changes)
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

// Create the database instance
export const database = new Database({
  adapter,
  modelClasses: models,
});

// Initialize database (seed if needed)
export async function initializeDatabase(): Promise<void> {
  try {
    await seedExerciseTypes(database);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Export everything for convenience
export { schema } from './schema';
export * from './models';
export type { Database } from '@nozbe/watermelondb';
