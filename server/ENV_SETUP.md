# Server Environment Variables Setup

Create a `.env` file in the `server/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ciphersqlstudio_app

# LLM API Configuration (OpenAI)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Alternative: If using Gemini
# GEMINI_API_KEY=your_gemini_api_key_here
```

## Instructions

1. Copy this file content
2. Create a new file named `.env` in the `server/` directory
3. Replace the placeholder values with your actual credentials
4. Never commit the `.env` file to version control (it's already in .gitignore)

