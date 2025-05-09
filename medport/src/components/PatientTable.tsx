import React, { useState } from 'react';
import type { Patient } from '../models/Patient';

interface PatientTableProps {
  patients: Patient[];
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({ patients, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Patient>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  // Sort patients based on sort field and direction
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle sort click
  const handleSort = (field: keyof Patient) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: keyof Patient) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* Search input */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search patients by name, department, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {patients.length === 0 ? (
          <div className="alert alert-info">No patients found.</div>
        ) : sortedPatients.length === 0 ? (
          <div className="alert alert-info">No patients match your search.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                    ID{renderSortIndicator('id')}
                  </th>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Name{renderSortIndicator('name')}
                  </th>
                  <th onClick={() => handleSort('age')} style={{ cursor: 'pointer' }}>
                    Age{renderSortIndicator('age')}
                  </th>
                  <th onClick={() => handleSort('department')} style={{ cursor: 'pointer' }}>
                    Department{renderSortIndicator('department')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPatients.map(patient => (
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
        )}
        <div className="mt-2 text-muted small">
          Showing {sortedPatients.length} of {patients.length} patients
        </div>
      </div>
    </div>
  );
};

export default PatientTable;