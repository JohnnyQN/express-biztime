const express = require("express");
const db = require("../db");
const slugify = require("slugify");
const router = express.Router();

// GET / => list of companies
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT code, name, description FROM companies ORDER BY code");
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/companies/:code - Get a specific company by code
router.get("/:code", async (req, res, next) => {
  const { code } = req.params;

  try {
    const result = await db.query("SELECT * FROM companies WHERE code = $1", [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/companies - Create a new company
router.post("/", async (req, res, next) => {
  const { name, description } = req.body;

  try {
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    const code = slugify(name, { lower: true });

    const result = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *",
      [code, name, description]
    );
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/v1/companies/:code - Update a company by code
router.put("/:code", async (req, res, next) => {
  const { code } = req.params;
  const { name, description } = req.body;

  try {
    if (!name || !description) {
      return res.status(400).json({ error: "Name and description are required" });
    }

    const result = await db.query(
      "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *",
      [name, description, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/v1/companies/:code - Delete a company by code
router.delete("/:code", async (req, res, next) => {
  const { code } = req.params;

  try {
    const result = await db.query("DELETE FROM companies WHERE code = $1 RETURNING *", [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    return res.status(200).json({ message: `Company with code ${code} deleted` });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
