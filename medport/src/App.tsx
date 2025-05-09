import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import PatientForm from './components/PatientForm';
import PatientTable from './components/PatientTable';
import SqlQueryTool from './components/SqlQueryTool';

function App() {
  // Define patient data directly in App component
  const patientData = [
    { id: 1, name: 'John Doe', age: 45, department: 'Cardiology' },
    { id: 2, name: 'Jane Smith', age: 32, department: 'Neurology' },
    { id: 3, name: 'Robert Johnson', age: 58, department: 'Orthopedics' },
    { id: 4, name: 'Emily Davis', age: 27, department: 'Pediatrics' },
    { id: 5, name: 'Michael Wilson', age: 63, department: 'Oncology' },
  ];

  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [patients, setPatients] = useState(patientData);

  const handleFormSubmit = (formData: {
    patientId: string;
    patientName: string;
    department: string;
  }) => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert('Patient data submitted!');
  };

  const handleExecuteQuery = (query: string) => {
    console.log('Executing query:', query);
    // This is where you would typically send the query to your backend
    // For now, we'll just simulate a response
    setQueryResults(patientData);
  };

  const handleViewPatient = (patient: any) => {
    console.log('Viewing patient:', patient);
    // Implement view functionality
  };

  const handleEditPatient = (patient: any) => {
    console.log('Editing patient:', patient);
    // Implement edit functionality
  };

  return (
    <div className="container-fluid p-0">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="row m-0">
        {/* Left side - 60% width */}
        <div className="col-md-7 p-3">
          {/* Top-left: Form */}
          <PatientForm onSubmit={handleFormSubmit} />

          {/* Bottom-left: Table */}
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