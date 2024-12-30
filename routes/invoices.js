const express = require("express");
const db = require("../db");
const ExpressError = require("../expressError");

const router = new express.Router();

// GET / => list of invoices
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices ORDER BY id");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

// GET /[id] => detail on invoice
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
       FROM invoices AS i
       INNER JOIN companies AS c ON i.comp_code = c.code
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice not found: ${id}`, 404);
    }

    const invoice = result.rows[0];
    return res.json({
      invoice: {
        id: invoice.id,
        amt: invoice.amt,
        paid: invoice.paid,
        add_date: invoice.add_date,
        paid_date: invoice.paid_date,
        company: {
          code: invoice.comp_code,
          name: invoice.name,
          description: invoice.description,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
});

// POST / => add new invoice
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    if (!comp_code || !amt) {
      return res.status(400).json({ error: "comp_code and amt are required" });
    }

    const company = await db.query("SELECT * FROM companies WHERE code = $1", [comp_code]);
    if (company.rows.length === 0) {
      throw new ExpressError(`Company with code ${comp_code} not found`, 404);
    }

    const result = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *",
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// PUT /[id] => update invoice
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt, paid } = req.body;

    if (amt === undefined || paid === undefined) {
      throw new ExpressError("Missing required fields: amt, paid", 400);
    }

    const currInvoice = await db.query("SELECT * FROM invoices WHERE id = $1", [id]);
    if (currInvoice.rows.length === 0) {
      throw new ExpressError(`Invoice not found: ${id}`, 404);
    }

    const paidDate = paid
      ? currInvoice.rows[0].paid ? currInvoice.rows[0].paid_date : new Date()
      : null;

    const result = await db.query(
      "UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING *",
      [amt, paid, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});


// DELETE /[id] => delete invoice
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice not found: ${id}`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
