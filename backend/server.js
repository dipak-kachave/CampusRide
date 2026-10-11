const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to CampusRide Backend"
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log("CampusRide server running on port 5000");
});
