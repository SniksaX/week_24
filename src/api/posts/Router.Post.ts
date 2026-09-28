import { Router } from 'express';
import PostController from './Controller.Post';

const router = Router();

router.get('/', PostController.list);
router.post('/', PostController.create);
router.delete('/:id', PostController.remove);

export default router;
