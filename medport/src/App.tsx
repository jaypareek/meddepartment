import { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import PatientForm, { type PatientFormData } from './components/PatientForm';
import PatientTable from './components/PatientTable';
import SqlQueryTool from './components/SqlQueryTool';
import LocalStorageSync from './components/LocalStorageSync';

// Database services
import { 
  initDatabase, 
  getAllPatients, 
  executeQuery,
  addPatient,
  addUpdateListener
} from './services/database';

// Models
import type { Patient } from './models/Patient';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Function to load patients data
  const loadPatients = useCallback(async () => {
    try {
      console.log('Loading patients data...');
      const patientData = await getAllPatients();
      console.log('Patients loaded:', patientData);
      setPatients(patientData);
      return patientData;
    } catch (err) {
      console.error('Error loading patients:', err);
      throw err;
    }
  }, []);

  // Initialize database and load patients
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('Initializing database...');
        await initDatabase();
        await loadPatients();
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(`Failed to load patient data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    initApp();
  }, [lastRefresh, loadPatients]);

  // Set up listener for data changes from other tabs
  useEffect(() => {
    console.log('Setting up data update listener');
    
    // This function will be called whenever data changes in any tab
    const handleDataUpdate = async () => {
      console.log('Data update detected, refreshing patients...');
      try {
        setLoading(true);
        await loadPatients();
        setLoading(false);
      } catch (err) {
        console.error('Error refreshing data after update:', err);
        setLoading(false);
      }
    };
    
    // Register the listener and get the cleanup function
    const removeListener = addUpdateListener(handleDataUpdate);
    
    // Clean up the listener when the component unmounts
    return () => {
      console.log('Cleaning up data update listener');
      removeListener();
    };
  }, [loadPatients]);

  // Function to refresh data
  const refreshData = () => {
    setLoading(true);
    setLastRefresh(new Date());
  };

  const handleFormSubmit = async (formData: PatientFormData) => {
    try {
      setLoading(true);
      
      // Convert form data to patient data
      const newPatient = {
        name: formData.patientName,
        age: formData.age,
        department: formData.department
      };
      
      console.log('Adding new patient:', newPatient);
      
      // Add patient to database
      const addedPatient = await addPatient(newPatient);
      console.log('Patient added:', addedPatient);
      
      // Refresh the patient list
      await loadPatients();
      
      setLoading(false);
      alert('Patient registered successfully!');
    } catch (err) {
      console.error('Error submitting patient:', err);
      alert('Failed to register patient.');
      setLoading(false);
    }
  };

  const handleExecuteQuery = async (query: string) => {
    try {
      setLoading(true);
      console.log('Executing query:', query);
      const results = await executeQuery(query);
      console.log('Query results:', results);
      setQueryResults(results);
      
      // If it was a modification query (INSERT, UPDATE, DELETE), refresh patient list
      const lowerQuery = query.toLowerCase().trim();
      if (
        lowerQuery.startsWith('insert') || 
        lowerQuery.startsWith('update') || 
        lowerQuery.startsWith('delete')
      ) {
        console.log('Modification query detected, refreshing patient list');
        await loadPatients();
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Query execution error:', err);
      setQueryResults([]);
      alert(`Query error: ${err.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    console.log('Viewing patient:', patient);
    // Show patient details in a modal or alert
    alert(`
      Patient Details:
      ID: ${patient.id}
      Name: ${patient.name}
      Age: ${patient.age}
      Department: ${patient.department}
    `);
  };

  const handleEditPatient = (patient: Patient) => {
    console.log('Editing patient:', patient);
    // In a real app, you would open a modal with a form
    // For now, just show an alert
    alert(`Editing patient: ${patient.name} - This would open an edit form in a real app.`);
  };

  if (loading && patients.length === 0) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Database Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please check the console for more details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Include the LocalStorageSync component for cross-tab communication */}
      <LocalStorageSync onDataChange={loadPatients} />
      
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="row m-0">
        {/* Left side - 60% width */}
        <div className="col-md-7 p-3">
          {/* Top-left: Form */}
          <PatientForm onSubmit={handleFormSubmit} />

          {/* Bottom-left: Table */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>Patient Records ({patients.length})</h5>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Refreshing...
                </>
              ) : 'Refresh Data'}
            </button>
          </div>
          
          {loading && patients.length > 0 && (
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                <div>Refreshing patient data...</div>
              </div>
            </div>
          )}
          
          <PatientTable 
            patients={patients} 
            onView={handleViewPatient} 
            onEdit={handleEditPatient} 
          />
        </div>

        {/* Right side - 40% width */}
        <div className="col-md-5 p-3 bg-light">
          <SqlQueryTool 
            onExecuteQuery={handleExecuteQuery}
            queryResults={queryResults}
          />
        </div>
      </div>
    </div>
  );
}

export default App;