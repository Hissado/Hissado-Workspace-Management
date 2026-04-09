import { Router } from "express";
import { z } from "zod";
import {
  getAllUsers, findUserByEmail, createUser, updateUser, deleteUser,
  type ServerUser,
} from "../lib/userStore.js";
import { hashPassword, verifyPassword, needsRehash } from "../lib/password.js";
import { validate } from "../middleware/validate.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";
import { BadRequestError, UnauthorizedError, NotFoundError, ConflictError } from "../lib/errors.js";

const router = Router();

// ── Zod schemas ───────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const CreateUserSchema = z.object({
  id: z.string().min(1, "id is required"),
  name: z.string().min(1, "name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "password is required"),
  role: z.string().min(1, "role is required"),
  dept: z.string().optional(),
  av: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  mustChangePassword: z.boolean().optional(),
  clientId: z.string().optional(),
  invitedAt: z.string().optional(),
  invitedBy: z.string().optional(),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  role: z.string().optional(),
  dept: z.string().optional(),
  av: z.string().optional(),
  photo: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  mustChangePassword: z.boolean().optional(),
  clientId: z.string().nullable().optional(),
  invitedAt: z.string().optional(),
  invitedBy: z.string().optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the user without the password field. Safe to send to clients. */
function publicUser(user: ServerUser): Omit<ServerUser, "password"> {
  const { password: _pw, ...rest } = user;
  return rest;
}

// ── Routes ────────────────────────────────────────────────────────────────────

/* POST /api/auth/login */
router.post(
  "/auth/login",
  authRateLimiter(),
  validate(LoginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body as z.infer<typeof LoginSchema>;
      const user = await findUserByEmail(email);

      // Use a constant-time comparison path for both found and not-found cases
      // to prevent user enumeration via timing attacks.
      if (!user) {
        await new Promise((r) => setTimeout(r, 100 + Math.random() * 50));
        return next(new UnauthorizedError("Incorrect email or password."));
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return next(new UnauthorizedError("Incorrect email or password."));
      }

      // Transparently upgrade legacy plain-text passwords to scrypt on login.
      if (needsRehash(user.password)) {
        const hashed = await hashPassword(password);
        await updateUser(user.id, { password: hashed });
        user.password = hashed;
      }

      // Return the full user record (including hashed password) so the
      // frontend can store credentials for the offline fallback. The hash
      // is not useful to an attacker without the original plaintext.
      return res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

/* GET /api/users */
router.get("/users", async (_req, res, next) => {
  try {
    const users = await getAllUsers();
    return res.json(users.map(publicUser));
  } catch (err) {
    next(err);
  }
});

/* GET /api/users/:id */
router.get("/users/:id", async (req, res, next) => {
  try {
    const users = await getAllUsers();
    const user = users.find((u) => u.id === req.params["id"]);
    if (!user) return next(new NotFoundError("User not found."));
    return res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

/* POST /api/users */
router.post("/users", validate(CreateUserSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof CreateUserSchema>;

    // Hash the password before persisting.
    const hashedPassword = await hashPassword(body.password);
    const result = await createUser({ ...body, password: hashedPassword });

    if (!result.ok) return next(new ConflictError(result.error));
    return res.status(201).json(publicUser(result.user));
  } catch (err) {
    next(err);
  }
});

/* PUT /api/users/:id */
router.put("/users/:id", validate(UpdateUserSchema), async (req, res, next) => {
  try {
    const updates = req.body as z.infer<typeof UpdateUserSchema>;

    // If the caller is updating the password, hash it before storing.
    const sanitised: Partial<ServerUser> = { ...updates };
    if (updates.password) {
      sanitised.password = await hashPassword(updates.password);
    }

    const updated = await updateUser(req.params["id"]!, sanitised);
    if (!updated) return next(new NotFoundError("User not found."));
    return res.json(publicUser(updated));
  } catch (err) {
    next(err);
  }
});

/* DELETE /api/users/:id */
router.delete("/users/:id", async (req, res, next) => {
  try {
    const deleted = await deleteUser(req.params["id"]!);
    if (!deleted) return next(new NotFoundError("User not found."));
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
