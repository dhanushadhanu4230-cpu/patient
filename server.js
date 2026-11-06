const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_MYSQL_PASSWORD",
    database: "patient_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("MySQL Connected Successfully!");
    }
});

// VIEW ALL PATIENTS
app.get("/api/patients", (req, res) => {
    db.query("SELECT * FROM patients", (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
    });
});

// ADD PATIENT
app.post("/api/patients", (req, res) => {
    const {
        patient_name,
        patient_email,
        phone_no,
        gender,
        age,
        problem
    } = req.body;

    const sql = `INSERT INTO patients
    (patient_name, patient_email, phone_no, gender, age, problem)
    VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql,
        [patient_name, patient_email, phone_no, gender, age, problem],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });

            res.json({
                message: "Patient added successfully!",
                patient_id: result.insertId
            });
        }
    );
});

// FIND PATIENT
app.get("/api/patients/:id", (req, res) => {
    db.query(
        "SELECT * FROM patients WHERE patient_id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            if (results.length === 0) {
                return res.status(404).json({ message: "Patient not found." });
            }

            res.json(results[0]);
        }
    );
});

// UPDATE PATIENT
app.put("/api/patients/:id", (req, res) => {
    const {
        patient_name,
        patient_email,
        phone_no,
        gender,
        age,
        problem
    } = req.body;

    const sql = `UPDATE patients SET
    patient_name = ?,
    patient_email = ?,
    phone_no = ?,
    gender = ?,
    age = ?,
    problem = ?
    WHERE patient_id = ?`;

    db.query(sql,
        [patient_name, patient_email, phone_no, gender, age, problem, req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Patient not found." });
            }

            res.json({ message: "Patient updated successfully!" });
        }
    );
});

// DELETE PATIENT
app.delete("/api/patients/:id", (req, res) => {
    db.query(
        "DELETE FROM patients WHERE patient_id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ message: err.message });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Patient not found." });
            }

            res.json({ message: "Patient deleted successfully!" });
        }
    );
});

// START SERVER
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});