import express from "express";

console.log("Starting minimal server...");

const app = express();
console.log("Express app created");

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});