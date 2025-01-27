const express = require("express");
const router = new express.Router();

const { validate } = require("jsonschema");

const bookSchema = require("../schemas/bookSchema.json");

const jsonschema = require("jsonschema");

const Book = require("../models/book");
const ExpressError = require("../expressError");



/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   validate request payLoad against json Schema
 * If valid, attempt to create a new book. If validation fails, return ExpressError
 */

router.post("/", async function (req, res, next) {
    try {
      // Validate request body against bookSchema
      const validation = jsonschema.validate(req.body, bookSchema);

      // If validation fails, create a new ExpressError
      if (!validation.valid) {
        return next({
          status: 400,
          error: validation.errors.map(error => error.stack)
        });
      }

      // Attempt to create a new book.
      const book = await Book.create(req.body);
      return res.status(201).json({book});
    } catch (err) {
      return next(err);
    }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
    try {
      if ("isbn" in req.body) {
        return next({
          status: 400,
          message: "Not allowed"
        });
      }

      // Validate the request body against bookSchema
      const validation = jsonschema.validate(req.body, bookSchema);

      // If validation fails, return an error
      if (!validation.valid) {
        return next({
          status: 400,
          errors: validation.errors.map(error => error.stack)
        });
      }

      // Attempt to update a book.
      const book = await Book.update(req.params.isbn, req.body);
      return res.json({ book });
    } catch (err) {
      return next(err);
    }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
