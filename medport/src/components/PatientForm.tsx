import React, { useState } from 'react';

// Define the interface locally to avoid import issues
interface PatientFormData {
  patientId: string;
  patientName: string;
  department: string;
}

interface PatientFormProps {
  onSubmit: (formData: PatientFormData) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    patientId: '',
    patientName: '',
    department: ''
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
              <label htmlFor="patientId" className="form-label">Patient ID</label>
              <input 
                type="text" 
                className="form-control" 
                id="patientId" 
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                required
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
          <div className="mb-3">
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
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="oncology">Oncology</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>
    </div>
  );
};

// Export the component and the interface
export default PatientForm;
export type { PatientFormData };