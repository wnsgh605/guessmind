import { join } from "path";
import express from "express";
import socketIO from "socket.io";

const PORT = 3000;
const app = express();
app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));
app.use(express.static(join(__dirname, "static")));
app.get("/", (req, res) => res.render("home"));

const handleListening = () =>
  console.log(`Server Running on http://localhost:${PORT}`);

app.listen(PORT, handleListening);
