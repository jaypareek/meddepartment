# MedPort - Patient Management System

MedPort is a modern patient management system built with React and PGlite, providing a client-side SQL database for managing patient records. The application allows healthcare professionals to register patients, query records using SQL, and maintain data persistence across page refreshes and multiple browser tabs.

## Features

- **Patient Registration**: Add new patients with name, age, and department information
- **SQL Query Tool**: Execute custom SQL queries against the patient database
- **Data Persistence**: Patient data persists across page refreshes using IndexedDB
- **Multi-Tab Support**: Changes made in one tab are automatically reflected in other open tabs
- **Responsive Design**: Built with Bootstrap for a clean, mobile-friendly interface

## Technology Stack

- **Frontend**: React 19, TypeScript
- **UI Framework**: Bootstrap 5
- **Database**: PGlite (client-side SQL database)
- **Build Tool**: Vite
- **Cross-Tab Communication**: BroadcastChannel API with localStorage fallback

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/medport.git
   cd medport
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

1. Create a production build:
   ```bash
   npm run build
   ```

2. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Usage Guide

### Patient Registration

1. Fill out the Patient Registration form with:
   - Patient Name
   - Age
   - Department (select from dropdown)
2. Click "Register Patient" to add the patient to the database

### Viewing Patient Records

- All registered patients appear in the Patient Records table
- Use the search box to filter patients by name, department, or ID
- Click column headers to sort the table by that column
- Click "Refresh Data" to manually update the patient list

### SQL Query Tool

- Enter SQL queries in the text area
- Click "Run Query" to execute the query
- Results appear in the table below
- Example queries:
  ```sql
  -- Get all patients
  SELECT * FROM patients;
  
  -- Get patients from a specific department
  SELECT * FROM patients WHERE department = 'Cardiology';
  
  -- Add a new patient
  INSERT INTO patients (name, age, department) VALUES ('Alice Brown', 42, 'Neurology');
  
  -- Update a patient's information
  UPDATE patients SET department = 'Cardiology' WHERE id = 1;
  
  -- Delete a patient
  DELETE FROM patients WHERE id = 3;
  ```

## Data Persistence

MedPort uses PGlite with IndexedDB for client-side data persistence. This means:

- Data is stored in the browser's IndexedDB storage
- Data persists across page refreshes and browser restarts
- Each browser profile has its own separate database
- Data is shared between tabs of the same browser profile

## Cross-Tab Synchronization

When multiple tabs of MedPort are open:

1. Changes made in one tab are automatically reflected in other tabs
2. This includes adding, updating, or deleting patients
3. SQL queries that modify data also trigger synchronization

## Browser Compatibility

MedPort works best in modern browsers that support:
- IndexedDB
- BroadcastChannel API (with localStorage fallback for older browsers)
- WebAssembly (required by PGlite)

Recommended browsers:
- Chrome 80+
- Firefox 78+
- Edge 80+
- Safari 14.1+

## License

[MIT License](LICENSE)

## Acknowledgements

- [PGlite](https://electric-sql.com/docs/api/pglite) - Client-side SQL database
- [React](https://react.dev/) - UI library
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool