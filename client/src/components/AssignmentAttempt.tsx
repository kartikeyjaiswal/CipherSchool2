import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Assignment, executeQuery, getHint, saveProgress, getAssignment } from '../services/api';
import './AssignmentAttempt.scss';

interface AssignmentAttemptProps {
  assignmentId: string;
  onBack: () => void;
  userId?: string;
}

const AssignmentAttempt: React.FC<AssignmentAttemptProps> = ({
  assignmentId,
  onBack,
  userId,
}) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [activeTab, setActiveTab] = useState<'question' | 'sampleData' | 'results'>('question');

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const data = await getAssignment(assignmentId, userId);
      setAssignment(data.assignment);
      setSqlQuery(data.userProgress?.sqlQuery || '');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQueryResult(null);

      const result = await executeQuery(assignmentId, sqlQuery, userId);

      if (result.success && result.data) {
        setQueryResult(result.data);
        setActiveTab('results');
        
        // Save progress
        if (userId) {
          await saveProgress(assignmentId, userId, sqlQuery, false);
        }
      } else {
        setError(result.error || 'Query execution failed');
        setQueryResult(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to execute query');
      setQueryResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    try {
      setLoadingHint(true);
      const hintText = await getHint(assignmentId, sqlQuery, error || undefined);
      setHint(hintText);
    } catch (err: any) {
      setError('Failed to get hint');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSaveProgress = async () => {
    if (userId && sqlQuery.trim()) {
      try {
        await saveProgress(assignmentId, userId, sqlQuery, false);
        alert('Progress saved!');
      } catch (err: any) {
        alert('Failed to save progress');
      }
    }
  };

  if (loading && !assignment) {
    return (
      <div className="assignment-attempt assignment-attempt--loading">
        <div className="assignment-attempt__spinner">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="assignment-attempt assignment-attempt--error">
        <p>Assignment not found</p>
        <button onClick={onBack} className="assignment-attempt__back-btn">
          Back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="assignment-attempt">
      <header className="assignment-attempt__header">
        <button onClick={onBack} className="assignment-attempt__back-btn">
          ← Back to Assignments
        </button>
        <h1 className="assignment-attempt__title">{assignment.title}</h1>
        <span className={`assignment-attempt__difficulty assignment-attempt__difficulty--${assignment.difficulty.toLowerCase()}`}>
          {assignment.difficulty}
        </span>
      </header>

      <div className="assignment-attempt__container">
        {/* Left Panel - Question and Sample Data */}
        <div className="assignment-attempt__left-panel">
          <div className="assignment-attempt__tabs">
            <button
              className={`assignment-attempt__tab ${activeTab === 'question' ? 'assignment-attempt__tab--active' : ''}`}
              onClick={() => setActiveTab('question')}
            >
              Question
            </button>
            <button
              className={`assignment-attempt__tab ${activeTab === 'sampleData' ? 'assignment-attempt__tab--active' : ''}`}
              onClick={() => setActiveTab('sampleData')}
            >
              Sample Data
            </button>
            <button
              className={`assignment-attempt__tab ${activeTab === 'results' ? 'assignment-attempt__tab--active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
          </div>

          <div className="assignment-attempt__tab-content">
            {activeTab === 'question' && (
              <div className="assignment-attempt__question">
                <h2>Assignment Question</h2>
                <p>{assignment.question}</p>
                <div className="assignment-attempt__description">
                  <h3>Description</h3>
                  <p>{assignment.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'sampleData' && (
              <div className="assignment-attempt__sample-data">
                <h2>Sample Tables</h2>
                {assignment.sampleTables.map((table, idx) => (
                  <div key={idx} className="assignment-attempt__table">
                    <h3 className="assignment-attempt__table-name">{table.tableName}</h3>
                    <div className="assignment-attempt__table-schema">
                      <h4>Schema:</h4>
                      <ul>
                        {table.columns.map((col, colIdx) => (
                          <li key={colIdx}>
                            <strong>{col.columnName}</strong> ({col.dataType})
                          </li>
                        ))}
                      </ul>
                    </div>
                    {table.rows && table.rows.length > 0 && (
                      <div className="assignment-attempt__table-data">
                        <h4>Sample Data:</h4>
                        <div className="assignment-attempt__table-wrapper">
                          <table>
                            <thead>
                              <tr>
                                {table.columns.map((col) => (
                                  <th key={col.columnName}>{col.columnName}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows.slice(0, 10).map((row, rowIdx) => (
                                <tr key={rowIdx}>
                                  {table.columns.map((col) => (
                                    <td key={col.columnName}>{row[col.columnName] ?? 'NULL'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {table.rows.length > 10 && (
                            <p className="assignment-attempt__table-note">
                              Showing first 10 rows of {table.rows.length} total rows
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="assignment-attempt__results">
                <h2>Query Results</h2>
                {queryResult ? (
                  <div className="assignment-attempt__results-content">
                    <p className="assignment-attempt__results-count">
                      {queryResult.rowCount} row(s) returned
                    </p>
                    <div className="assignment-attempt__table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            {queryResult.columns.map((col: any) => (
                              <th key={col.name}>{col.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.rows.map((row: any, idx: number) => (
                            <tr key={idx}>
                              {queryResult.columns.map((col: any) => (
                                <td key={col.name}>{row[col.name] ?? 'NULL'}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="assignment-attempt__no-results">
                    No results yet. Execute a query to see results here.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - SQL Editor */}
        <div className="assignment-attempt__right-panel">
          <div className="assignment-attempt__editor-header">
            <h2>SQL Editor</h2>
            <div className="assignment-attempt__editor-actions">
              <button
                onClick={handleGetHint}
                className="assignment-attempt__hint-btn"
                disabled={loadingHint}
              >
                {loadingHint ? 'Loading...' : '💡 Get Hint'}
              </button>
              {userId && (
                <button
                  onClick={handleSaveProgress}
                  className="assignment-attempt__save-btn"
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {hint && (
            <div className="assignment-attempt__hint-box">
              <h3>💡 Hint</h3>
              <p>{hint}</p>
              <button
                onClick={() => setHint(null)}
                className="assignment-attempt__close-hint"
              >
                ×
              </button>
            </div>
          )}

          <div className="assignment-attempt__editor-wrapper">
            <Editor
              height="400px"
              defaultLanguage="sql"
              value={sqlQuery}
              onChange={(value) => setSqlQuery(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {error && (
            <div className="assignment-attempt__error-box">
              <strong>Error:</strong> {error}
            </div>
          )}

          <button
            onClick={handleExecuteQuery}
            className="assignment-attempt__execute-btn"
            disabled={loading || !sqlQuery.trim()}
          >
            {loading ? 'Executing...' : '▶ Execute Query'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentAttempt;

