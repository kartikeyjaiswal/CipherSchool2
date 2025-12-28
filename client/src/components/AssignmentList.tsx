import React, { useEffect, useState } from 'react';
import { getAssignments, AssignmentListItem } from '../services/api';
import './AssignmentList.scss';

interface AssignmentListProps {
  onSelectAssignment: (assignmentId: string) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ onSelectAssignment }) => {
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'assignment-list__difficulty--easy';
      case 'Medium':
        return 'assignment-list__difficulty--medium';
      case 'Hard':
        return 'assignment-list__difficulty--hard';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="assignment-list assignment-list--loading">
        <div className="assignment-list__spinner">Loading assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignment-list assignment-list--error">
        <div className="assignment-list__error-message">
          <p>Error: {error}</p>
          <button onClick={loadAssignments} className="assignment-list__retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-list">
      <header className="assignment-list__header">
        <h1 className="assignment-list__title">CipherSQLStudio</h1>
        <p className="assignment-list__subtitle">Practice SQL queries with real assignments</p>
      </header>

      <div className="assignment-list__container">
        {assignments.length === 0 ? (
          <div className="assignment-list__empty">
            <p>No assignments available. Please contact an administrator.</p>
          </div>
        ) : (
          <ul className="assignment-list__grid">
            {assignments.map((assignment) => (
              <li key={assignment._id} className="assignment-list__item">
                <div className="assignment-list__card">
                  <div className="assignment-list__card-header">
                    <h2 className="assignment-list__card-title">{assignment.title}</h2>
                    <span
                      className={`assignment-list__difficulty ${getDifficultyColor(
                        assignment.difficulty
                      )}`}
                    >
                      {assignment.difficulty}
                    </span>
                  </div>
                  <p className="assignment-list__card-description">{assignment.description}</p>
                  <button
                    onClick={() => onSelectAssignment(assignment._id)}
                    className="assignment-list__start-btn"
                  >
                    Start Assignment
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignmentList;

