require("dotenv").config();
const express = require("express");
const cors = require("cors");
const evaluationRoutes = require("./routes/evaluation");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/evaluation", evaluationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
