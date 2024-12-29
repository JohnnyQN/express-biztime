const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/v1/companies - Get all companies
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM companies");
    return res.status(200).json({ companies: result.rows });
  } catch (err) {
    console.error("Error fetching companies", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/v1/companies/:code - Get a specific company by code
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await db.query("SELECT * FROM companies WHERE code = $1", [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    console.error(`Error fetching company with code ${code}`, err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/v1/companies - Create a new company
router.post("/", async (req, res) => {
  const { code, name, description } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    console.error("Error creating company", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/v1/companies/:code - Update a company by code
router.put("/:code", async (req, res) => {
  const { code } = req.params;
  const { name, description } = req.body;

  try {
    const result = await db.query(
      "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *",
      [name, description, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    console.error(`Error updating company with code ${code}`, err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/v1/companies/:code - Delete a company by code
router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM companies WHERE code = $1 RETURNING *",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({ message: `Company with code ${code} deleted` });
  } catch (err) {
    console.error(`Error deleting company with code ${code}`, err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
