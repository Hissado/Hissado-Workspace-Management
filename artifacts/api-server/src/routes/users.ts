import { Router } from "express";
import {
  getAllUsers, findUserByEmail, createUser, updateUser, deleteUser,
} from "../lib/userStore";

const router = Router();

/* ── Auth login ────────────────────────────────────────────── */
router.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const user = findUserByEmail(email as string);
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }
  /* Return full user object (password included so frontend can store it in
     localStorage exactly as before — consistent with the existing data shape) */
  res.json({ user });
});

/* ── List all users (passwords stripped) ───────────────────── */
router.get("/users", (_req, res) => {
  const users = getAllUsers().map(({ password: _pw, ...u }) => u);
  res.json(users);
});

/* ── Get single user (with password, for currentUser restore) ─ */
router.get("/users/:id", (req, res) => {
  const all = getAllUsers();
  const user = all.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(user);
});

/* ── Create user ───────────────────────────────────────────── */
router.post("/users", (req, res) => {
  const user = req.body;
  if (!user?.id || !user?.email) {
    return res.status(400).json({ error: "id and email are required." });
  }
  const result = createUser(user);
  if (!result.ok) return res.status(409).json({ error: result.error });
  res.status(201).json(result.user);
});

/* ── Update user ───────────────────────────────────────────── */
router.put("/users/:id", (req, res) => {
  const updated = updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "User not found." });
  res.json(updated);
});

/* ── Delete user ───────────────────────────────────────────── */
router.delete("/users/:id", (req, res) => {
  const deleted = deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found." });
  res.json({ ok: true });
});

export default router;
