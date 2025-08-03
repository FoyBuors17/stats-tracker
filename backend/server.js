import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.get(`/api/message`, (req, res) => {
  res.json({ message: "Hello from the server" });
});

app.post(`/api/message`, (req, res) => {
  const {name }  = req.body;
  console.log(name);
  res.json({message: `Hello, ${name}, data was received`});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});