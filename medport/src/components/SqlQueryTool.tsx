import React, { useState } from 'react';

interface SqlQueryToolProps {
  initialQuery?: string;
  onExecuteQuery: (query: string) => void;
  queryResults: any[];
}

const SqlQueryTool: React.FC<SqlQueryToolProps> = ({ 
  initialQuery = 'SELECT * FROM patients LIMIT 10;', 
  onExecuteQuery,
  queryResults
}) => {
  const [sqlQuery, setSqlQuery] = useState(initialQuery);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
  };

  const executeQuery = () => {
    onExecuteQuery(sqlQuery);
  };

  return (
    <div className="card">
      <div className="card-header bg-light">
        <h5 className="mb-0">SQL Query Tool</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor="sqlQuery" className="form-label">Enter SQL Query</label>
          <textarea 
            className="form-control code-font" 
            id="sqlQuery" 
            rows={5}
            value={sqlQuery}
            onChange={handleQueryChange}
          ></textarea>
        </div>
        <button 
          className="btn btn-success mb-3" 
          onClick={executeQuery}
        >
          Run Query
        </button>
        
        {/* Query Results */}
        <div className="query-results mt-3">
          <h6>Query Results:</h6>
          {queryResults.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    {Object.keys(queryResults[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResults.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">No results to display. Run a query to see results.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SqlQueryTool;