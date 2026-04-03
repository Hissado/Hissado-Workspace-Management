import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inviteRouter from "./invite";
import signalRouter from "./signal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(inviteRouter);
router.use(signalRouter);

export default router;
