import React, { useState, useEffect } from 'react';

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
  const [isExecuting, setIsExecuting] = useState(false);
  const [savedQueries, setSavedQueries] = useState<string[]>([]);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  // Load saved queries from localStorage on component mount
  useEffect(() => {
    const savedQueriesFromStorage = localStorage.getItem('medport_saved_queries');
    if (savedQueriesFromStorage) {
      setSavedQueries(JSON.parse(savedQueriesFromStorage));
    }

    const queryHistoryFromStorage = localStorage.getItem('medport_query_history');
    if (queryHistoryFromStorage) {
      setQueryHistory(JSON.parse(queryHistoryFromStorage));
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return;
    
    setIsExecuting(true);
    try {
      await onExecuteQuery(sqlQuery);
      
      // Add to query history
      const newHistory = [sqlQuery, ...queryHistory.filter(q => q !== sqlQuery)].slice(0, 10);
      setQueryHistory(newHistory);
      localStorage.setItem('medport_query_history', JSON.stringify(newHistory));
    } finally {
      setIsExecuting(false);
    }
  };

  const saveQuery = () => {
    if (!sqlQuery.trim() || savedQueries.includes(sqlQuery)) return;
    
    const newSavedQueries = [...savedQueries, sqlQuery];
    setSavedQueries(newSavedQueries);
    localStorage.setItem('medport_saved_queries', JSON.stringify(newSavedQueries));
  };

  const loadQuery = (query: string) => {
    setSqlQuery(query);
  };

  const removeSavedQuery = (index: number) => {
    const newSavedQueries = [...savedQueries];
    newSavedQueries.splice(index, 1);
    setSavedQueries(newSavedQueries);
    localStorage.setItem('medport_saved_queries', JSON.stringify(newSavedQueries));
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
        <div className="d-flex mb-3">
          <button 
            className="btn btn-success me-2" 
            onClick={executeQuery}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Running...
              </>
            ) : 'Run Query'}
          </button>
          <button 
            className="btn btn-outline-secondary me-2" 
            onClick={saveQuery}
          >
            Save Query
          </button>
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary dropdown-toggle" 
              type="button" 
              id="historyDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              History
            </button>
            <ul className="dropdown-menu" aria-labelledby="historyDropdown">
              {queryHistory.length === 0 ? (
                <li><span className="dropdown-item text-muted">No history</span></li>
              ) : (
                queryHistory.map((query, index) => (
                  <li key={index}>
                    <button 
                      className="dropdown-item text-truncate" 
                      style={{ maxWidth: '300px' }}
                      onClick={() => loadQuery(query)}
                    >
                      {query}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        
        {/* Saved Queries */}
        {savedQueries.length > 0 && (
          <div className="mb-3">
            <h6>Saved Queries</h6>
            <div className="list-group">
              {savedQueries.map((query, index) => (
                <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <button 
                    className="btn btn-link text-start p-0 text-truncate" 
                    style={{ maxWidth: '80%', border: 'none' }}
                    onClick={() => loadQuery(query)}
                  >
                    {query}
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => removeSavedQuery(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
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