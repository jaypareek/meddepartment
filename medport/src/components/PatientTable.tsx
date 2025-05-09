import React from 'react';

interface PatientTableProps {
  patients: Array<{
    id: number;
    name: string;
    age: number;
    department: string;
  }>;
  onView?: (patient: any) => void;
  onEdit?: (patient: any) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, onView, onEdit }) => {
  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">Patient Records</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.department}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => onView && onView(patient)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onEdit && onEdit(patient)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientTable;