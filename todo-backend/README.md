# To-Do App Backend

A simple Node.js + Express + MongoDB API with JWT authentication and task CRUD.

## Folder structure

```
todo-backend/
├── src/
│   ├── config/db.js          # MongoDB connection
│   ├── models/                # Mongoose schemas (User, Task)
│   ├── middleware/auth.js     # JWT verification middleware
│   ├── controllers/           # Business logic for auth & tasks
│   ├── routes/                # API endpoint definitions
│   └── server.js              # App entry point
├── .env.example                # Template for environment variables
└── package.json
```

## 1. Prerequisites

- Node.js installed (you already have this, since RN CLI needs it too)
- MongoDB running somewhere. Easiest options:
  - **Local**: install MongoDB Community Server (https://www.mongodb.com/try/download/community) and run it — it listens on `mongodb://127.0.0.1:27017` by default.
  - **Cloud (recommended for beginners)**: create a free cluster on MongoDB Atlas (https://www.mongodb.com/cloud/atlas/register) and copy its connection string.

## 2. Setup

```bash
cd todo-backend
npm install
```

Then create your real environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string (e.g. mash your keyboard for 40 characters)

## 3. Run the server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5000
```

## 4. Test it works

Visit `http://localhost:5000` in a browser — you should see `{"message":"To-Do API is running 🚀"}`.

Test registration with curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

You should get back a `token` and `user` object. Save the token — you'll need it (as `Authorization: Bearer <token>`) to call any `/api/tasks` endpoint.

## API Reference

### Auth (public)
| Method | Endpoint             | Body                          |
|--------|-----------------------|--------------------------------|
| POST   | /api/auth/register    | `{ email, password }`         |
| POST   | /api/auth/login       | `{ email, password }`         |

### Tasks (require `Authorization: Bearer <token>` header)
| Method | Endpoint          | Body                                                              |
|--------|-------------------|---------------------------------------------------------------------|
| GET    | /api/tasks        | —                                                                    |
| POST   | /api/tasks        | `{ title, description, dateTime, deadline, priority }`             |
| PUT    | /api/tasks/:id    | any subset of the above fields, plus `{ completed: true/false }`    |
| DELETE | /api/tasks/:id    | —                                                                    |

## Important: connecting from a real Android device/emulator

When we get to the React Native app, remember:
- **Android Emulator**: use `http://10.0.2.2:5000` instead of `localhost` to reach your computer's server.
- **Physical Android phone**: use your computer's local network IP (e.g. `http://192.168.1.5:5000`), and make sure your phone is on the same Wi-Fi network.

We'll cover this again when we build the app's API layer.
