import { PGlite } from '@electric-sql/pglite';
import type { Patient } from '../models/Patient';
import { notifyTabsViaLocalStorage } from '../components/LocalStorageSync';

// Initialize PGlite database
let db: PGlite | null = null;
let dbInitPromise: Promise<PGlite> | null = null;

// Database name for persistence
const DB_URL = 'idb://medport_db';

// Create a broadcast channel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;

// Try to create the broadcast channel
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('medport_data_updates');
    console.log('BroadcastChannel created successfully');
  } else {
    console.log('BroadcastChannel API not available, will use localStorage fallback');
  }
} catch (error) {
  console.error('Error creating BroadcastChannel:', error);
}

// Event types for cross-tab communication
const UPDATE_EVENTS = {
  PATIENT_ADDED: 'PATIENT_ADDED',
  PATIENT_UPDATED: 'PATIENT_UPDATED',
  PATIENT_DELETED: 'PATIENT_DELETED',
  QUERY_EXECUTED: 'QUERY_EXECUTED'
};

// List of callbacks to be called when data changes
const updateListeners: Array<() => void> = [];

// Add a listener for data updates
export function addUpdateListener(callback: () => void): () => void {
  updateListeners.push(callback);
  console.log(`Update listener added. Total listeners: ${updateListeners.length}`);
  
  // Return a function to remove the listener
  return () => {
    const index = updateListeners.indexOf(callback);
    if (index !== -1) {
      updateListeners.splice(index, 1);
      console.log(`Update listener removed. Remaining listeners: ${updateListeners.length}`);
    }
  };
}

// Notify all listeners that data has changed
function notifyDataChanged(source: string) {
  console.log(`Notifying ${updateListeners.length} listeners of data change from ${source}`);
  updateListeners.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in update listener callback:', error);
    }
  });
}

// Set up broadcast channel listener
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    console.log('Received message from another tab:', event.data);
    // Notify listeners when we receive an update from another tab
    notifyDataChanged('broadcast');
  };
}

// Broadcast an update to other tabs
function broadcastUpdate(eventType: string, data?: any) {
  if (broadcastChannel) {
    const message = { type: eventType, data, timestamp: Date.now() };
    console.log('Broadcasting update to other tabs:', message);
    broadcastChannel.postMessage(message);
  } else {
    console.log('BroadcastChannel not available, using localStorage fallback');
    notifyTabsViaLocalStorage();
  }
}

export async function initDatabase(): Promise<PGlite> {
  // If we already have a database instance, return it
  if (db) return db;
  
  // If we're in the process of initializing, return the promise
  if (dbInitPromise) return dbInitPromise;
  
  // Create a new initialization promise
  dbInitPromise = (async () => {
    try {
      console.log('Creating PGlite instance with URL:', DB_URL);
      
      // Create a new PGlite instance with proper URL format for persistence
      db = await PGlite.create(DB_URL);
      
      console.log('PGlite instance created successfully');
      
      // Create tables
      await db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER NOT NULL,
          department TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Patients table created or verified');
      
      // Check if we need to insert initial data
      const result = await db.query('SELECT COUNT(*) as count FROM patients');
      console.log('Current patient count:', result.rows[0].count);
      
      if (result.rows[0].count === 0) {
        console.log('Inserting sample data...');
        // Insert sample data
        await db.query(`
          INSERT INTO patients (name, age, department) VALUES
          ('John Doe', 45, 'Cardiology'),
          ('Jane Smith', 32, 'Neurology'),
          ('Robert Johnson', 58, 'Orthopedics'),
          ('Emily Davis', 27, 'Pediatrics'),
          ('Michael Wilson', 63, 'Oncology')
        `);
        console.log('Sample data inserted successfully');
      }
      
      return db;
    } catch (error) {
      console.error('Error initializing database:', error);
      dbInitPromise = null; // Reset the promise so we can try again
      throw error;
    }
  })();
  
  return dbInitPromise;
}

export async function getAllPatients(): Promise<Patient[]> {
  try {
    const database = await initDatabase();
    const result = await database.query('SELECT * FROM patients ORDER BY id');
    console.log(`Retrieved ${result.rows.length} patients`);
    return result.rows as Patient[];
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
}

export async function addPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
  try {
    const database = await initDatabase();
    console.log('Adding patient:', patient);
    const result = await database.query(
      'INSERT INTO patients (name, age, department) VALUES ($1, $2, $3) RETURNING *',
      [patient.name, patient.age, patient.department]
    );
    
    const newPatient = result.rows[0] as Patient;
    console.log('Patient added successfully:', newPatient);
    
    // Broadcast the update to other tabs
    broadcastUpdate(UPDATE_EVENTS.PATIENT_ADDED, newPatient);
    
    // Notify local listeners
    notifyDataChanged('local-add');
    
    return newPatient;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
}

export async function executeQuery(query: string): Promise<any[]> {
  try {
    const database = await initDatabase();
    console.log('Executing query:', query);
    const result = await database.query(query);
    console.log('Query result:', result.rows);
    
    // Check if this is a modification query
    const lowerQuery = query.toLowerCase().trim();
    if (
      lowerQuery.startsWith('insert') || 
      lowerQuery.startsWith('update') || 
      lowerQuery.startsWith('delete')
    ) {
      // Broadcast the update to other tabs
      broadcastUpdate(UPDATE_EVENTS.QUERY_EXECUTED, { query });
      
      // Notify local listeners
      notifyDataChanged('local-query');
    }
    
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

// New function to search patients by name or department
export async function searchPatients(searchTerm: string): Promise<Patient[]> {
  const database = await initDatabase();
  const result = await database.query(
    `SELECT * FROM patients 
     WHERE name ILIKE $1 OR department ILIKE $1 
     ORDER BY id`,
    [`%${searchTerm}%`]
  );
  return result.rows as Patient[];
}

// New function to get patient by ID
export async function getPatientById(id: number): Promise<Patient | null> {
  const database = await initDatabase();
  const result = await database.query(
    'SELECT * FROM patients WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as Patient;
}

// New function to update patient
export async function updatePatient(id: number, patientData: Partial<Omit<Patient, 'id'>>): Promise<Patient | null> {
  const database = await initDatabase();
  
  // Build the SET clause dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;
  
  if (patientData.name !== undefined) {
    updates.push(`name = $${paramIndex}`);
    values.push(patientData.name);
    paramIndex++;
  }
  
  if (patientData.age !== undefined) {
    updates.push(`age = $${paramIndex}`);
    values.push(patientData.age);
    paramIndex++;
  }
  
  if (patientData.department !== undefined) {
    updates.push(`department = $${paramIndex}`);
    values.push(patientData.department);
    paramIndex++;
  }
  
  if (updates.length === 0) {
    return getPatientById(id); // No updates to make
  }
  
  // Add the ID as the last parameter
  values.push(id);
  
  const result = await database.query(
    `UPDATE patients SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const updatedPatient = result.rows[0] as Patient;
  
  // Broadcast the update to other tabs
  broadcastUpdate(UPDATE_EVENTS.PATIENT_UPDATED, updatedPatient);
  
  // Notify local listeners
  notifyDataChanged('local-update');
  
  return updatedPatient;
}

// New function to delete patient
export async function deletePatient(id: number): Promise<boolean> {
  const database = await initDatabase();
  const result = await database.query(
    'DELETE FROM patients WHERE id = $1 RETURNING id',
    [id]
  );
  
  const success = result.rows.length > 0;
  
  if (success) {
    // Broadcast the update to other tabs
    broadcastUpdate(UPDATE_EVENTS.PATIENT_DELETED, { id });
    
    // Notify local listeners
    notifyDataChanged('local-delete');
  }
  
  return success;
}