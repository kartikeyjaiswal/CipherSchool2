import React, { useState } from 'react';
import AssignmentList from './components/AssignmentList';
import AssignmentAttempt from './components/AssignmentAttempt';
import './App.scss';

function App() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [userId] = useState<string>(() => {
    // Generate or retrieve user ID (for demo, using sessionStorage)
    let id = sessionStorage.getItem('userId');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('userId', id);
    }
    return id;
  });

  const handleSelectAssignment = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
  };

  const handleBackToList = () => {
    setSelectedAssignmentId(null);
  };

  return (
    <div className="app">
      {selectedAssignmentId ? (
        <AssignmentAttempt
          assignmentId={selectedAssignmentId}
          onBack={handleBackToList}
          userId={userId}
        />
      ) : (
        <AssignmentList onSelectAssignment={handleSelectAssignment} />
      )}
    </div>
  );
}

export default App;
