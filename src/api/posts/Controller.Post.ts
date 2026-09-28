import type { Request, Response } from 'express';
import Post from '../db/DB.Model.Post';

class PostController {
  list(req: Request, res: Response) {
    const posts = Post.listByUser(req.session.user!.id);
    res.json({ posts });
  }

  create(req: Request, res: Response) {
    const body = String(req.body?.body ?? '').trim();
    if (!body) {
      res.status(400).json({ message: 'Post body is required' });
      return;
    }
    const post = new Post(0, req.session.user!.id, body, new Date()).create();
    res.status(201).json({ post });
  }

  remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid post id' });
      return;
    }
    const deleted = Post.deleteForUser(id, req.session.user!.id);
    if (!deleted) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json({ message: 'Post removed' });
  }
}

export default new PostController();
