const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Reset database state before each test
beforeEach(async () => {
  // Clear and reset database
  await db.query("TRUNCATE companies CASCADE");
  await db.query("TRUNCATE invoices CASCADE");

  // Reinsert test data
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

afterEach(() => {
  console.log("Test finished.");
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Returns a list of companies", async () => {
    const res = await request(app).get("/api/v1/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body.companies).toEqual([
      { code: "apple", name: "Apple Computer", description: "Maker of OSX." },
      { code: "ibm", name: "IBM", description: "Big blue." },
    ]);
  });
});
