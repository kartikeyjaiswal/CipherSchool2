import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  sampleTables: SampleTable[];
  expectedOutput: {
    type: string;
    value: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SampleTable {
  tableName: string;
  columns: {
    columnName: string;
    dataType: string;
  }[];
  rows: any[];
}

export interface AssignmentListItem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
}

export interface QueryResult {
  success: boolean;
  data?: {
    rows: any[];
    rowCount: number;
    columns: {
      name: string;
      dataType: number;
    }[];
  };
  error?: string;
  code?: string;
}

export interface HintResponse {
  success: boolean;
  data: {
    hint: string;
  };
}

// Get all assignments
export const getAssignments = async (): Promise<AssignmentListItem[]> => {
  const response = await api.get('/assignments');
  return response.data.data;
};

// Get assignment by ID
export const getAssignment = async (id: string, userId?: string): Promise<{
  assignment: Assignment;
  userProgress: {
    sqlQuery: string;
    isCompleted: boolean;
    attemptCount: number;
  };
}> => {
  const params = userId ? { userId } : {};
  const response = await api.get(`/assignments/${id}`, { params });
  return response.data.data;
};

// Execute SQL query
export const executeQuery = async (
  assignmentId: string,
  query: string,
  userId?: string
): Promise<QueryResult> => {
  const response = await api.post('/query/execute', {
    assignmentId,
    query,
    userId,
  });
  return response.data;
};

// Get hint
export const getHint = async (
  assignmentId: string,
  userQuery?: string,
  errorMessage?: string
): Promise<string> => {
  const response = await api.post<HintResponse>('/hints/get', {
    assignmentId,
    userQuery,
    errorMessage,
  });
  return response.data.data.hint;
};

// Save user progress
export const saveProgress = async (
  assignmentId: string,
  userId: string,
  sqlQuery: string,
  isCompleted: boolean
): Promise<void> => {
  await api.post(`/assignments/${assignmentId}/progress`, {
    userId,
    sqlQuery,
    isCompleted,
  });
};

export default api;

