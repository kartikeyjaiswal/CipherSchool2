# Data Flow Diagram - CipherSQLStudio

## User Query Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. User clicks "Execute Query"
                                    ▼
                    ┌───────────────────────────────┐
                    │   AssignmentAttempt Component │
                    │   - Captures SQL query        │
                    │   - Validates input           │
                    └───────────────────────────────┘
                                    │
                                    │ 2. POST /api/query/execute
                                    │    { assignmentId, query, userId }
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express.js)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. Route Handler
                                    ▼
                    ┌───────────────────────────────┐
                    │   /api/query/execute          │
                    │   - Validates request         │
                    │   - Checks for dangerous ops  │
                    └───────────────────────────────┘
                                    │
                                    │ 4. Fetch Assignment
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONGODB (Atlas)                                 │
│                                                                          │
│  ┌──────────────────────┐                                               │
│  │  Assignment Document │                                               │
│  │  - title             │                                               │
│  │  - question          │                                               │
│  │  - sampleTables      │                                               │
│  │  - expectedOutput    │                                               │
│  └──────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 5. Assignment data returned
                                    ▼
                    ┌───────────────────────────────┐
                    │   Database Service            │
                    │   - Create workspace schema  │
                    │   - Initialize tables         │
                    └───────────────────────────────┘
                                    │
                                    │ 6. Execute Query in Schema
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL (Sandbox DB)                             │
│                                                                          │
│  Database: ciphersqlstudio_app                                          │
│  ┌─────────────────────────────────────┐                               │
│  │ Schema: workspace_{assignmentId}    │                               │
│  │  ├── Table: customers               │                               │
│  │  │   ├── id (INTEGER)               │                               │
│  │  │   ├── name (TEXT)                 │                               │
│  │  │   └── email (TEXT)                │                               │
│  │  └── Table: orders                  │                               │
│  │      ├── id (INTEGER)                │                               │
│  │      └── customer_id (INTEGER)       │                               │
│  └─────────────────────────────────────┘                               │
│                                                                          │
│  SET search_path TO workspace_{assignmentId};                          │
│  SELECT * FROM customers;                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 7. Query Results
                                    ▼
                    ┌───────────────────────────────┐
                    │   Format Results              │
                    │   - rows                      │
                    │   - rowCount                  │
                    │   - columns                   │
                    └───────────────────────────────┘
                                    │
                                    │ 8. JSON Response
                                    │    { success: true, data: {...} }
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 9. Update State
                                    ▼
                    ┌───────────────────────────────┐
                    │   AssignmentAttempt Component │
                    │   - setQueryResult(data)      │
                    │   - setActiveTab('results')   │
                    │   - Display results table     │
                    └───────────────────────────────┘
                                    │
                                    │ 10. Render Results
                                    ▼
                    ┌───────────────────────────────┐
                    │   Results Panel                │
                    │   - Table with query results  │
                    │   - Row count display          │
                    └───────────────────────────────┘
```

## Hint Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. User clicks "Get Hint"
                                    ▼
                    ┌───────────────────────────────┐
                    │   AssignmentAttempt Component │
                    │   - Captures current query    │
                    │   - Captures error (if any)   │
                    └───────────────────────────────┘
                                    │
                                    │ 2. POST /api/hints/get
                                    │    { assignmentId, userQuery, errorMessage }
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express.js)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. Route Handler
                                    ▼
                    ┌───────────────────────────────┐
                    │   /api/hints/get              │
                    │   - Validates request         │
                    └───────────────────────────────┘
                                    │
                                    │ 4. Fetch Assignment
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONGODB (Atlas)                                 │
│                                                                          │
│  ┌──────────────────────┐                                               │
│  │  Assignment Document │                                               │
│  │  - question          │                                               │
│  │  - sampleTables      │                                               │
│  └──────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 5. Assignment data
                                    ▼
                    ┌───────────────────────────────┐
                    │   LLM Service                │
                    │   - Build prompt             │
                    │   - Include assignment info  │
                    │   - Include user query       │
                    │   - Include error (if any)   │
                    └───────────────────────────────┘
                                    │
                                    │ 6. API Call
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      OPENAI API (or Gemini)                             │
│                                                                          │
│  System Prompt:                                                          │
│  "You are a helpful SQL tutor. Provide hints, not solutions."            │
│                                                                          │
│  User Prompt:                                                            │
│  - Assignment question                                                   │
│  - Table schemas                                                         │
│  - User's current query (if any)                                         │
│  - Error message (if any)                                               │
│                                                                          │
│  Response: Hint text (not the solution)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 7. Hint Text
                                    ▼
                    ┌───────────────────────────────┐
                    │   Format Response             │
                    │   { success: true,            │
                    │     data: { hint: "..." } }   │
                    └───────────────────────────────┘
                                    │
                                    │ 8. JSON Response
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 9. Update State
                                    ▼
                    ┌───────────────────────────────┐
                    │   AssignmentAttempt Component │
                    │   - setHint(hintText)         │
                    │   - Display hint box          │
                    └───────────────────────────────┘
                                    │
                                    │ 10. Render Hint
                                    ▼
                    ┌───────────────────────────────┐
                    │   Hint Box                    │
                    │   - Displays hint message     │
                    │   - Close button              │
                    └───────────────────────────────┘
```

## Assignment Loading Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. Component Mounts
                                    ▼
                    ┌───────────────────────────────┐
                    │   AssignmentList Component    │
                    │   - useEffect hook            │
                    └───────────────────────────────┘
                                    │
                                    │ 2. GET /api/assignments
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express.js)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. Route Handler
                                    ▼
                    ┌───────────────────────────────┐
                    │   /api/assignments            │
                    │   - Query MongoDB             │
                    └───────────────────────────────┘
                                    │
                                    │ 4. Fetch All Assignments
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MONGODB (Atlas)                                 │
│                                                                          │
│  ┌──────────────────────┐                                               │
│  │  Assignment Document │                                               │
│  │  - _id               │                                               │
│  │  - title             │                                               │
│  │  - description        │                                               │
│  │  - difficulty        │                                               │
│  │  - createdAt         │                                               │
│  └──────────────────────┘                                               │
│                                                                          │
│  [Multiple Assignment Documents]                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 5. Array of Assignments
                                    ▼
                    ┌───────────────────────────────┐
                    │   Format Response             │
                    │   { success: true,            │
                    │     data: [assignments...] }  │
                    └───────────────────────────────┘
                                    │
                                    │ 6. JSON Response
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (React)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 7. Update State
                                    ▼
                    ┌───────────────────────────────┐
                    │   AssignmentList Component     │
                    │   - setAssignments(data)       │
                    │   - setLoading(false)          │
                    └───────────────────────────────┘
                                    │
                                    │ 8. Render List
                                    ▼
                    ┌───────────────────────────────┐
                    │   Assignment Cards             │
                    │   - Grid layout                │
                    │   - Title, description         │
                    │   - Difficulty badge          │
                    │   - "Start Assignment" button  │
                    └───────────────────────────────┘
```

## State Updates Summary

### Frontend State Management
- **AssignmentList**: `assignments[]`, `loading`, `error`
- **AssignmentAttempt**: 
  - `assignment`, `sqlQuery`, `queryResult`
  - `loading`, `error`, `hint`, `activeTab`

### Backend State
- **MongoDB**: Persistent storage for assignments and user progress
- **PostgreSQL**: Temporary sandbox schemas per assignment (created on-demand)

### Key State Transitions
1. **Assignment Selection**: `selectedAssignmentId` changes → Load assignment details
2. **Query Execution**: `sqlQuery` → Execute → `queryResult` updated
3. **Hint Request**: `hint` state updated with LLM response
4. **Tab Navigation**: `activeTab` switches between 'question', 'sampleData', 'results'

---

**Note**: This diagram represents the complete data flow from user interaction to database operations and back. Each numbered step represents a distinct operation in the application flow.

