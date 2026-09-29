import type { Request, Response } from 'express';
import Post from '../db/DB.Model.Post';
import User from '../db/DB.Model.User';

async function userId(req: Request): Promise<number | undefined> {
  if (!req.user) return undefined;
  const user = await User.findOne(req.user.email);
  return user?.id;
}

class PostController {
  async list(req: Request, res: Response) {
    const id = await userId(req);
    if (id === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    res.json({ posts: await Post.listByUser(id) });
  }

  async create(req: Request, res: Response) {
    const id = await userId(req);
    const body = String(req.body?.body ?? '').trim();
    if (id === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!body) {
      res.status(400).json({ message: 'Post body is required' });
      return;
    }
    const post = await new Post(0, id, body, new Date()).create();
    res.status(201).json({ post });
  }

  async remove(req: Request, res: Response) {
    const ownerId = await userId(req);
    const id = Number(req.params.id);
    if (ownerId === undefined) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid post id' });
      return;
    }
    const deleted = await Post.deleteForUser(id, ownerId);
    if (!deleted) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.json({ message: 'Post removed' });
  }
}

export default new PostController();
