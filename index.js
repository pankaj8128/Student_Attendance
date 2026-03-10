const express = require("express");
const app = express();
app.use(express.json());

require("dotenv").config();
const port = process.env.port || 3000;

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const path = require("path");
app.use(express.static(path.join(__dirname, "frontend")));

const student_route = require("./routes/student");
const attendance_route = require("./routes/attendance");
const teacher_route = require("./routes/teacher");
app.use("/student", student_route);
app.use("/attendance", attendance_route);
app.use("/teacher", teacher_route);

const loginvalidator = require("./validators/login");
const signupvalidator = require("./validators/signup");
const validate = require("./middlewares/validate");
const { auth } = require("./middlewares/auth");
const login = require("./controllers/login");
const signup = require("./controllers/signup");
const dashboard = require("./controllers/dashboard");
const logout = require("./controllers/logout");

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", auth, (req, res) => {
  res.redirect("dashboard");
});

app.get("/dashboard", auth, dashboard);
app.post("/login", validate(loginvalidator), login);
app.post("/signup", validate(signupvalidator), signup);
app.post("/logout", logout);

app.listen(port, () => {
  console.log(`Listening on port: ${port}. Visit: http://localhost:${port}`);
});
