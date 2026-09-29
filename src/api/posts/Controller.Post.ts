import type { Request, Response } from 'express';
import Post from '../db/DB.Model.Post';
import User from '../db/DB.Model.User';

function userId(req: Request): number | undefined {
  return req.user ? User.findOne(req.user.email)?.id : undefined;
}

class PostController {
  list(req: Request, res: Response) {
    const id = userId(req);
    if (id === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    res.json({ posts: Post.listByUser(id) });
  }

  create(req: Request, res: Response) {
    const id = userId(req);
    const body = String(req.body?.body ?? '').trim();
    if (id === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!body) {
      res.status(400).json({ message: 'Post body is required' });
      return;
    }
    const post = new Post(0, id, body, new Date()).create();
    res.status(201).json({ post });
  }

  remove(req: Request, res: Response) {
    const ownerId = userId(req);
    const id = Number(req.params.id);
    if (ownerId === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid post id' });
      return;
    }
    const deleted = Post.deleteForUser(id, ownerId);
    if (!deleted) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json({ message: 'Post removed' });
  }
}

export default new PostController();
