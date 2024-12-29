const express = require("express");
const ExpressError = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");

const app = express();

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Prefix API version
app.use("/api/v1/companies", companiesRoutes);
app.use("/api/v1/invoices", invoicesRoutes);

// 404 Handler
app.use((req, res, next) => {
  const err = new ExpressError(`Resource not found: ${req.method} ${req.url}`, 404);
  return next(err);
});

// General error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.setHeader("X-Debug-Info", "Error occurred");

  return res.json({
    error: err.message,
    details: err.stack,
  });
});

module.exports = app;
