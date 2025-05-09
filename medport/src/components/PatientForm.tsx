import React, { useState } from 'react';

// Define the interface locally to avoid import issues
interface PatientFormData {
  patientId: string;
  patientName: string;
  department: string;
  age: number;
}

interface PatientFormProps {
  onSubmit: (formData: PatientFormData) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    patientId: '',
    patientName: '',
    department: '',
    age: 30
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    
    // Reset form after submission
    setFormData({
      patientId: '',
      patientName: '',
      department: '',
      age: 30
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    });
  };

  return (
    <div className="card mb-3">
      <div className="card-header bg-light">
        <h5 className="mb-0">Patient Registration</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleFormSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="patientId" className="form-label">Patient ID (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                id="patientId" 
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="col">
              <label htmlFor="patientName" className="form-label">Patient Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="patientName" 
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label htmlFor="age" className="form-label">Age</label>
              <input 
                type="number" 
                className="form-control" 
                id="age" 
                name="age"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col">
              <label htmlFor="department" className="form-label">Department</label>
              <select 
                className="form-select" 
                id="department" 
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Oncology">Oncology</option>
                <option value="General">General</option>
                <option value="Emergency">Emergency</option>
                <option value="Surgery">Surgery</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Register Patient</button>
        </form>
      </div>
    </div>
  );
};

// Export the component and the interface
export default PatientForm;
export type { PatientFormData };