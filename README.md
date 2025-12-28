# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

## 🎯 Project Overview

CipherSQLStudio allows users to:
- View SQL assignment questions with pre-loaded sample data
- Write and execute SQL queries in a browser-based editor (Monaco Editor)
- Get intelligent hints (not solutions) from an integrated LLM
- See query results in real-time

**Important**: This is NOT a database creation tool. Assignments and sample data are pre-inserted by administrators into the database.

## 🛠️ Technology Stack

### Frontend
- **React.js** with TypeScript
- **Monaco Editor** for SQL code editing
- **Vanilla SCSS** with mobile-first responsive design
- **Axios** for API calls

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** for sandbox database (query execution)
- **MongoDB Atlas** for persistence (assignments, user progress)
- **OpenAI API** for intelligent hint generation

## 📁 Project Structure

```
CipherSQLStudio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── styles/         # SCSS files (variables, mixins, base)
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Database configurations
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic (LLM service)
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- MongoDB Atlas account (or local MongoDB)
- OpenAI API key (or alternative LLM API)

### Step 1: Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, client)
npm run install-all
```

### Step 2: Database Setup

#### PostgreSQL Setup
1. Create a PostgreSQL database:
```sql
CREATE DATABASE ciphersqlstudio_app;
```

2. Update PostgreSQL connection in `server/.env`:
```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ciphersqlstudio_app
```

#### MongoDB Setup
1. Create a MongoDB Atlas cluster (or use local MongoDB)
2. Get your connection string
3. Update MongoDB connection in `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority
```

### Step 3: Environment Variables

#### Server Environment Variables
Create `server/.env` file (copy from `server/.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ciphersqlstudio_app

# LLM API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

#### Client Environment Variables
Create `client/.env` file (copy from `client/.env.example`):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 4: Initialize Sample Data

You'll need to insert sample assignments into MongoDB. You can use MongoDB Compass, MongoDB Shell, or create a script to insert assignments.

Example assignment structure:
```javascript
{
  title: "Find All Customers",
  description: "Retrieve all customer records from the database",
  difficulty: "Easy",
  question: "Write a SQL query to select all columns from the customers table.",
  sampleTables: [
    {
      tableName: "customers",
      columns: [
        { columnName: "id", dataType: "INTEGER" },
        { columnName: "name", dataType: "TEXT" },
        { columnName: "email", dataType: "TEXT" }
      ],
      rows: [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" }
      ]
    }
  ],
  expectedOutput: {
    type: "table",
    value: [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" }
    ]
  }
}
```

### Step 5: Run the Application

#### Development Mode (Both Frontend and Backend)
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Run Separately

**Backend only:**
```bash
npm run server
# or
cd server && npm run dev
```

**Frontend only:**
```bash
npm run client
# or
cd client && npm start
```

## 🏗️ Architecture

### PostgreSQL Sandboxing

The application uses PostgreSQL schemas to create isolated workspaces for each assignment:

- Each assignment gets its own schema: `workspace_{assignmentId}`
- Tables are created and populated with sample data in the schema
- User queries execute within the assignment's schema
- This ensures isolation between different assignments

### Data Flow

1. **User selects assignment** → Frontend fetches assignment from MongoDB
2. **User writes SQL query** → Query is sent to backend
3. **Backend validates query** → Checks for dangerous operations (DROP, DELETE, etc.)
4. **Backend executes query** → Query runs in PostgreSQL sandbox schema
5. **Results returned** → Frontend displays results in table format
6. **User requests hint** → Backend calls LLM API with assignment context
7. **Hint returned** → Frontend displays intelligent hint (not solution)

## 📱 Responsive Design

The application follows a mobile-first approach with breakpoints:
- **320px** (Mobile - default)
- **641px** (Tablet - `@include respond-to(sm)`)
- **1024px** (Desktop - `@include respond-to(md)`)
- **1281px** (Large Desktop - `@include respond-to(lg)`)

## 🔒 Security Features

- SQL query validation (only SELECT queries allowed)
- Blocked dangerous operations (DROP, DELETE, TRUNCATE, ALTER, CREATE, INSERT, UPDATE)
- Schema name sanitization to prevent SQL injection
- Input validation using express-validator

## 📊 API Endpoints

### Assignments
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/progress` - Save user progress

### Query Execution
- `POST /api/query/execute` - Execute SQL query

### Hints
- `POST /api/hints/get` - Get intelligent hint

## 🎨 SCSS Architecture

The project uses vanilla SCSS with:
- **Variables** (`_variables.scss`) - Colors, spacing, typography, breakpoints
- **Mixins** (`_mixins.scss`) - Reusable styles (buttons, flexbox, responsive)
- **Base** (`_base.scss`) - Global styles and resets
- **Component SCSS** - Component-specific styles following BEM naming

## 📝 Features

### Core Features (90%)
- ✅ Assignment listing page
- ✅ Assignment attempt interface with:
  - Question panel
  - Sample data viewer
  - SQL editor (Monaco Editor)
  - Results panel
  - LLM hint integration
- ✅ Query execution engine
- ✅ PostgreSQL sandboxing

### Optional Features (10%)
- ✅ User progress saving (session-based)
- ⚠️ Login/Signup system (not implemented - uses session-based user IDs)

## 🧪 Testing

To test the application:

1. Ensure PostgreSQL and MongoDB are running
2. Insert at least one assignment into MongoDB
3. Start the backend server
4. Start the frontend development server
5. Navigate to `http://localhost:3000`
6. Select an assignment and try writing SQL queries

## 📄 License

ISC

## 👥 Contributing

This is a learning project. Feel free to fork and extend it!

## 📞 Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

---

**Note**: Make sure to set up your environment variables correctly before running the application. The application requires both PostgreSQL and MongoDB to be running and properly configured.

