import * as Router from 'koa-router';

import { Auth } from './controllers/auth';
import { Data } from './controllers/data';
import { authenticate } from '../middlewares/auth';

const router = new Router();

router.prefix('/users');

router.post('/sign-up', Auth.singUp);
router.post('/sign-in', Auth.singIn);

router.post('/data', authenticate, Data.addUserData);
router.get('/data', authenticate, Data.retrieveUserData);
router.get('/data/list', Data.retrieveListOfUserData);

export default router;