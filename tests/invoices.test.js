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
  const invoicesResult = await db.query(`
    INSERT INTO invoices (id, comp_code, amt, paid, paid_date)
    VALUES (1, 'apple', 100, false, null),
           (2, 'apple', 200, false, null),
           (3, 'apple', 300, true, '2018-01-01'),
           (4, 'ibm', 400, false, null)
    RETURNING id, comp_code, amt, paid, paid_date;
  `);
  console.log("Inserted invoices:", invoicesResult.rows);
});

// Runs after each test: optional cleanup actions
afterEach(async () => {
  console.log("Test finished.");
});

// Runs after all tests: close database connection
afterAll(async () => {
  await db.end();
});

// Test GET /invoices
describe("GET /invoices", () => {
  test("Returns a list of invoices", async () => {
    const res = await request(app).get("/api/v1/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body.invoices).toBeInstanceOf(Array);
    expect(res.body.invoices.length).toBe(4);
  });
});

// Test GET /invoices/:id
describe("GET /invoices/:id", () => {
  test("Returns a specific invoice", async () => {
    const res = await request(app).get("/api/v1/invoices/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.invoice).toHaveProperty("id", 1);
    expect(res.body.invoice.company).toHaveProperty("code", "apple");
  });

  test("Responds with 404 for invalid invoice ID", async () => {
    const res = await request(app).get("/api/v1/invoices/999");
    expect(res.statusCode).toBe(404);
  });
});

// Test POST /invoices
describe("POST /invoices", () => {
  test("Creates a new invoice", async () => {
    const res = await request(app)
      .post("/api/v1/invoices")
      .send({ comp_code: "apple", amt: 500 });
    expect(res.statusCode).toBe(201);
    expect(res.body.invoice).toHaveProperty("id");
    expect(res.body.invoice.comp_code).toBe("apple");
  });

  test("Responds with 400 if missing data", async () => {
    const res = await request(app).post("/api/v1/invoices").send({ amt: 500 });
    expect(res.statusCode).toBe(400);
  });
});

// Test PUT /invoices/:id
describe("PUT /invoices/:id", () => {
    test("Updates an invoice", async () => {
      const res = await request(app)
        .put("/api/v1/invoices/1")
        .send({ amt: 600, paid: true });
      expect(res.statusCode).toBe(200);
      expect(res.body.invoice.amt).toBe(600);
      expect(res.body.invoice.paid).toBe(true);
      expect(res.body.invoice).toHaveProperty("paid_date");
    });
  
    test("Responds with 404 for invalid invoice ID", async () => {
      const res = await request(app).put("/api/v1/invoices/999").send({ amt: 600, paid: true });
      expect(res.statusCode).toBe(404);
    });
  
    test("Responds with 400 if missing data", async () => {
      const res = await request(app).put("/api/v1/invoices/1").send({});
      expect(res.statusCode).toBe(400);
    });
  });
 

// Test DELETE /invoices/:id
describe("DELETE /invoices/:id", () => {
  test("Deletes an invoice", async () => {
    const res = await request(app).delete("/api/v1/invoices/1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "deleted" });
  });

  test("Responds with 404 for invalid invoice ID", async () => {
    const res = await request(app).delete("/api/v1/invoices/999");
    expect(res.statusCode).toBe(404);
  });
});
