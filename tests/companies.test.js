const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Runs before each test: reset database state
beforeEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
           ('ibm', 'IBM', 'Big blue.');
  `);
  await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null),
           ('apple', 200, false, null),
           ('apple', 300, true, '2018-01-01'),
           ('ibm', 400, false, null);
  `);
});

// Runs after each test: optional cleanup actions
afterEach(async () => {
  // Optionally log or perform other cleanup steps here
  console.log("Test finished.");
});

// Runs after all tests: close database connection
afterAll(async () => {
  await db.end();
});

// Example test
describe("GET /companies", () => {
  test("Returns a list of companies", async () => {
    const res = await request(app).get("/api/v1/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toBeInstanceOf(Array);
    expect(res.body.companies.length).toBeGreaterThan(0); // Assuming there are companies in the DB
  });
});
