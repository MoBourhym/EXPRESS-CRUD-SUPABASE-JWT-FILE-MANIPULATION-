import express from "express";
import bodyParser from "body-parser";
import eventRoutes from "./routes/event.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import loginRoute from "./routes/login.routes.js";
import logoutRoute from "./routes/logout.routes.js";
import refreshRoute from "./routes/refresh.routes.js";
import activityRoute from './routes/activity.routes.js'
import departmentRouter from './routes/departement.routes.js'
import taskRouter from './routes/task.routes.js'
import verifyJWT from "./middleware/verifyJWT.js";
import credentials from "./middleware/credentials.js";
import corsOptions from "./config/corsOptions.js";
import verifyLogin from "./controllers/verifyLogin.controller.js";



const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(helmet());
app.use(credentials)
app.use(
  cors(corsOptions)
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/auth", loginRoute);
app.use("/auth/status",verifyLogin)
app.use("/refresh", refreshRoute);
app.use("/logout", logoutRoute);

// Protected routes app.use("/api/events", verifyJWT, eventRoutes);
app.use("/api/events", verifyJWT,eventRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/activity",activityRoute);
app.use("/api/department",departmentRouter);
app.use("/api/task",taskRouter);


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
