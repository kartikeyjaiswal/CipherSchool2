# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js (v16+) installed
- [ ] PostgreSQL installed and running
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] OpenAI API key (or alternative LLM API key)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From project root
npm run install-all
```

This installs dependencies for:
- Root package.json
- Server (Express, MongoDB, PostgreSQL drivers, etc.)
- Client (React, Monaco Editor, etc.)

### 2. Database Setup

#### PostgreSQL
1. Create database:
```sql
CREATE DATABASE ciphersqlstudio_app;
```

2. Update `server/.env`:
```env
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ciphersqlstudio_app
```

#### MongoDB
1. Get connection string from MongoDB Atlas (or use local MongoDB)
2. Update `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority
```

### 3. Environment Variables

#### Server (`server/.env`)
See `server/ENV_SETUP.md` for complete list.

Required variables:
- `MONGODB_URI`
- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`
- `OPENAI_API_KEY`

#### Client (`client/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Seed Sample Data

```bash
# From project root
node server/scripts/seedAssignments.js
```

This will insert 4 sample assignments into MongoDB.

### 5. Start the Application

#### Option A: Run Both Together
```bash
npm run dev
```

#### Option B: Run Separately

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Troubleshooting

### "Cannot connect to MongoDB"
- Check your `MONGODB_URI` in `server/.env`
- Ensure MongoDB Atlas IP whitelist includes your IP (or 0.0.0.0/0 for development)
- Test connection with MongoDB Compass

### "Cannot connect to PostgreSQL"
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `server/.env`
- Verify database exists: `psql -U postgres -l`

### "OpenAI API Error"
- Verify your API key in `server/.env`
- Check API key has sufficient credits
- The app will show a fallback hint if LLM fails

### "No assignments showing"
- Run the seed script: `node server/scripts/seedAssignments.js`
- Check MongoDB connection
- Verify assignments exist in MongoDB: Use MongoDB Compass or `mongo` shell

### Port Already in Use
- Backend (5000): Change `PORT` in `server/.env`
- Frontend (3000): Set `PORT=3001` in `client/.env` or use `npm start -- --port 3001`

## Next Steps

1. ✅ Verify assignments load on the homepage
2. ✅ Select an assignment and see the question
3. ✅ Try writing a SQL query in the editor
4. ✅ Click "Execute Query" to see results
5. ✅ Click "Get Hint" to test LLM integration

## Adding Your Own Assignments

You can add assignments directly to MongoDB or modify `server/scripts/seedAssignments.js` and re-run it.

Assignment structure:
```javascript
{
  title: "Your Assignment Title",
  description: "Brief description",
  difficulty: "Easy" | "Medium" | "Hard",
  question: "The SQL question text",
  sampleTables: [/* table definitions */],
  expectedOutput: {/* expected result */}
}
```

See `server/scripts/seedAssignments.js` for examples.

