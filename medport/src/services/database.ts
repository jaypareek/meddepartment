import { PGlite } from '@electric-sql/pglite';
import type { Patient } from '../models/Patient';

// Initialize PGlite database
let db: PGlite | null = null;

// Database name for persistence
const DB_NAME = 'medport_db';

// Use IndexedDB for persistence
const PERSISTENCE_TYPE = 'indexeddb';

export async function initDatabase() {
  if (db) return db;
  
  try {
    console.log('Initializing PGlite with persistence...');
    
    // Create a new PGlite instance with persistence
    db = new PGlite({
      dbName: DB_NAME,           // Database name for persistence
      persistenceType: PERSISTENCE_TYPE, // Use IndexedDB for storage
      shared: true,              // Enable sharing across browser tabs
    });
    
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
    throw error;
  }
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
    console.log('Patient added successfully:', result.rows[0]);
    return result.rows[0] as Patient;
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
  
  return result.rows[0] as Patient;
}

// New function to delete patient
export async function deletePatient(id: number): Promise<boolean> {
  const database = await initDatabase();
  const result = await database.query(
    'DELETE FROM patients WHERE id = $1 RETURNING id',
    [id]
  );
  
  return result.rows.length > 0;
}