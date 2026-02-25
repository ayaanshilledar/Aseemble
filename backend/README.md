# Assemble Backend Documentation

Welcome to the backend repository of Assemble. This document serves as a guide for developers to understand the structure, module workflow, coding standards, and technical stack of the project.

## 🏗 Backend Structure

The backend follows a modular, feature-based architecture. This means each feature (like `auth` or `room`) has its own self-contained directory with its routes, controllers, services, and schemas.

```text
backend/
├── prisma/                  # Database schema and migrations (Prisma)
│   └── schema.prisma        # Main Prisma schema file
├── src/
│   ├── config/              # Application-wide configurations and environment variables
│   ├── media/               # WebRTC/Mediasoup logic (SFU Manager, workers, peers)
│   ├── middleware/          # Express middlewares (e.g., error handling, authentication)
│   ├── modules/             # Feature-based modular logic (Core API)
│   │   ├── auth/            # Authentication module
│   │   └── room/            # Room management module
│   ├── realtime/            # Colyseus multiplayer game server logic
│   │   ├── rooms/           # Colyseus room definitions (e.g., GameRoom.ts)
│   │   └── schema/          # Colyseus state schemas
│   ├── types/               # Global TypeScript type definitions
│   ├── utils/               # Reusable helper functions (e.g., jwt generation)
│   └── index.ts             # Main entry point (Express & Colyseus server setup)
├── .env                     # Environment variables (Make sure to set this up locally)
└── package.json             # Project dependencies and scripts
```

---

## ⚙️ How the Modules Work

To maintain a clean separation of concerns, the API endpoints are structured using the **Route-Controller-Service** pattern, coupled with **Schema validation**.

When creating a new feature in the `src/modules` folder (e.g., `user`), you must structure it like this:

1. **`*.schema.ts` (Validation Layer)**
   - Uses `zod` to define the shape of incoming requests (body, params, query).
   - Validates the data before it even hits the controller.

2. **`*.route.ts` (Routing Layer)**
   - Defines the API endpoints (GET, POST, etc.) using Express router.
   - Applies middleware (e.g., auth check, zod validation).
   - Forwards the request to the appropriate controller method.

3. **`*.controller.ts` (Transport Layer)**
   - Receives the validated request from the route.
   - Extracts data from `req.body`, `req.params`, or `req.user`.
   - Calls the relevant function in the **Service** layer.
   - Formats and sends the HTTP response (success or error) back to the client. Keep HTTP logic *only* here.

4. **`*.service.ts` (Business Logic Layer)**
   - Contains the core business rules and database operations (using Prisma).
   - Should be completely oblivious to HTTP (no `req` or `res` objects).
   - Throws standard errors if something goes wrong, which are caught by the controller or global error handler.

---

## ✍️ Coding Guidelines for Better & Clean Code

To keep the codebase maintainable, readable, and strictly typed, please adhere to the following rules:

### 1. Separation of Concerns
- **Never put business logic in the controller.** The controller should only handle "request in, response out". Move logic to the service.
- **Never put HTTP logic in the service.** Services should return data or throw errors. They shouldn't know about Express responses.

### 2. Strict Typing & Validation
- Avoid using `any` at all costs. Always define interfaces or types in the `types/` directory or near module usage.
- Use **Zod** for all incoming request validation. Do not manually validate fields inside controllers.

### 3. Error Handling
- Use the global error middleware defined in `src/middleware/error.middleware.ts`.
- In controllers, wrap `async` processes in a `catch` block (or use an async wrapper) and pass the error to `next(error)`.
- Throw descriptive errors from services (e.g., `throw new Error('User not found')`).

### 4. Naming Conventions
- **Files:** Use a dot-separated naming convention indicating the file's role (e.g., `auth.controller.ts`, `jwt.utils.ts`).
- **Variables & Functions:** Use `camelCase`. Function names should be verbs (e.g., `getUserById`, `createRoom`).
- **Classes & Types/Interfaces:** Use `PascalCase` (e.g., `GameRoom`, `UserPayload`).

### 5. Asynchronous Code
- Always use `async/await` instead of `.then().catch()` chains for better readability.
- Be careful with loops; use `Promise.all()` when performing multiple independent asynchronous tasks simultaneously.

---

## 🛠 Technical Breakdown (Tech Stack)

Our backend combines a REST API with real-time websocket and WebRTC capabilities. Here’s how the stack fits together:

* **Node.js & Express:** The core framework handling the RESTful HTTP API.
* **TypeScript:** Provides static typing across the entire project, ensuring safety and better developer experience.
* **PostgreSQL:** Our primary relational database.
* **Prisma (ORM):** Used to interact with PostgreSQL. It provides a strongly typed database client and handles schema migrations (`prisma/schema.prisma`).
* **Colyseus:** Handles real-time server authoritative state and WebSocket connections (used for tracking player movements and real-time multiplayer states). Found in the `src/realtime` directory.
* **Mediasoup:** An SFU (Selective Forwarding Unit) used for WebRTC. It handles the heavy lifting of routing multi-party video and audio streams seamlessly. Found in the `src/media` directory.
* **Zod:** Used for schema declaration and validation of incoming API requests.
* **JWT & bcrypt:** Used for secure user authentication (hashing passwords and generating stateless access tokens).
