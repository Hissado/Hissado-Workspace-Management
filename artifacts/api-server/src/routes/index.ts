import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inviteRouter from "./invite";
import signalRouter from "./signal";
import usersRouter from "./users";
import remindersRouter from "./reminders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(inviteRouter);
router.use(signalRouter);
router.use(remindersRouter);

export default router;
