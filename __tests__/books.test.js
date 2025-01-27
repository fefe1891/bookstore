require('dotenv').config();
process.env.NODE_ENV = 'test';
console.log('NODE_ENV after setting to test:', process.env.NODE_ENV);
const request = require('supertest');
const app = require('../app');

const { Client } = require("pg");
const { DB_URI } = require("../config");


let db;
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;

beforeAll(async () => {
    try {
        console.log(DB_URI);
        db = new Client({ connectionString: DB_URI });
        await db.connect();
    } catch (err) {
        console.error(err);
        console.log(err.stack);
    }
}, 70000);

// Sample data
let book_isbn;

beforeEach(async () => {
    //Create a new db connection
    try {
        console.log(DB_URI);
        await db.query("BEGIN");

    let result = await db.query(
        `INSERT INTO books (
            isbn, amazon_url,
            author,language,
            pages,publisher,
            title,year)
            VALUES (
                '123432122',
                'https://amazon.com/taco',
                'Elie',
                'English',
                100,
                'Nothing publishers',
            'my first book', 2008)
    RETURNING isbn`);

    book_isbn = result.rows[0].isbn
    } catch (err) {
        console.error(err);
        console.log(err.stack);
    }
}, 70000);

describe("GET /books", function () {
    test("Gets a list of 1 book", async function () {
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty("isbn");
        expect(books[0]).toHaveProperty("amazon_url");
    });
});

// tests for POST /books
describe("POST /books", function () {
    test("Creates a new book", async function () {
        const response = await request(app).post(`/books`).send({
            isbn: '32794782',
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "amazing times",
            year: 2000
        });
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty("isbn");
    });

    test("Prevents creating book without required title", async function () {
        const response = await request(app).post(`/books`).send({year: 2000});
        expect(response.statusCode).toBe(400);
    });
});

describe("GET /books/:isbn", function () {
    test("Gets a single book", async function () {
        const res = await request(app).get(`/books/${book_isbn}`);
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });

    test("Responds with 404 if can't find book in question", async function () {
        const response = await request(app).get(`/books/999`);
        expect(response.statusCode).toBe(404);
    });
});

// tests for PUT /books/:isbn
describe("PUT /books/:id", function () {
    test("Updates a single book", async function () {
        const response = await request(app).put(`/books/${book_isbn}`).send({
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
        });
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.title).toBe("UPDATED BOOK"); // confirm the author field was updated
    });

    test("Prevents a bad book update", async function () {
        const response = await request(app).put(`/books/${book_isbn}`).send({
            isbn: "32794782",
            badField: "DO NOT ADD ME!",
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
        });
        expect(res.statusCode).toBe(404);
    });

    test("Responds 404 if can't find book in question", async function () {
        await request(app).delete(`/books/${book_isbn}`)
        const response = await request(app).delete(`/books/${book_isbn}`);
        expect(response.statusCode).toBe(404);
    });
});

// tests for DELETE /books/:isbn
describe("DELETE /books/:id", function () {
    test("Deletes a single a book", async function () {
        const response = await request(app).delete(`/books/${book_isbn}`)
        expect(response.body).toEqual({message: "Book deleted"});
    });
});

afterEach(async function () {
    try {
        console.log(DB_URI);
        await db.query("ROLLBACK");
    } catch (err) {
        console.log(err);
        console.log(err.stack);
    }
}, 70000);

afterAll(async () => {
    try {
        console.log(DB_URI);
        await db.end();
    } catch (err) {
        console.log(err);
        console.log(err.stack);
    }
}, 70000);