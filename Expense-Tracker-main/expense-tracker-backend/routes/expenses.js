const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");

// all expense routes require a valid JWT
router.use(auth);


/* ADD EXPENSE */
router.post("/", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const expense = new Expense({
      title,
      amount,
      category,
      date,
      userId: req.userId
    });

    await expense.save();

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* GET ALL EXPENSES FOR LOGGED IN USER */
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* UPDATE EXPENSE (only if it belongs to current user) */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Expense not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* DELETE EXPENSE (only if it belongs to current user) */
router.delete("/:id", async (req, res) => {
  try {
    const result = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!result) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;