const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id });
    
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });

  app.get('/api/flushall', async(req, res) => {
    const cache = require('../services/cache');
    await cache.flush();
    await cache.keys();
    res.status(200).send('Flushed');
  });

  app.get('/api/keys', async(req, res) => {
    const cache = require('../services/cache');
    const keys = await cache.keys();
    res.status(200).json(keys);
  });

  app.get('/api/cachetest', async(req, res) => {
    const cache = require('../services/cache');
    try {
      // cache.set('Yoshino', 'Yorita');
      cache.get('O').then(console.log);
      cache.get('K').then(console.log);
    
      res.sendStatus(200);
    } catch(error) {
      console.log(error);
    }
  })
};
