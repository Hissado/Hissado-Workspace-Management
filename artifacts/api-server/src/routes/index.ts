import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inviteRouter from "./invite";
import signalRouter from "./signal";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(inviteRouter);
router.use(signalRouter);

export default router;
