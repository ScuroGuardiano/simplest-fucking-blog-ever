import sirv from 'sirv';
import express from 'express';
import compression from 'compression';
import * as sapper from '@sapper/server';

import { BLOG_DATA, loadBlogData } from './blog';
import { join } from 'path';
loadBlogData();

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const app = express();

// It's alpha, I can do this.
app.use((req, res, next) => {
	res.setHeader('X-Powered-By', 'Our Mighty Lord - Satan');
	res.setHeader('X-Listen-To-Some-Good-Shit', 'https://www.youtube.com/watch?v=ap0UDOGDpCI');
	res.setHeader('X-I-Hope-You-Like-Metal', 'https://www.youtube.com/watch?v=CTN2ZzpQRh4');
	res.setHeader('X-Will-Guardiano-Ever-Grow-Up', 'false');
	res.setHeader('X-Check-Out-My-Github', 'https://github.com/ScuroGuardiano');
	next();
})

app.use(compression({ threshold: 0 }));
app.use(sirv('static', { dev }))


/** 
 * Important note. This maps images from blog folder.
 * 
 * Name of folder containing blog **HAS TO BE THE SAME AS POST'S SLUG**
 * 
 * Second thing is that this maps to root level, if you have your blog on
 * for example /blog, you must change here to /blog/:slug/:asset.
 * 
 * Third thing, this won't currently work in subfolders! You're assets must be
 * at the root level of blog post folder, as showed on examples. But okey
 * For future me:
 * Image has to be on blog/slug/image.jpg, if I do blog/slug/images/image.jpg this shit won't work!
 * Okey, try to access /kaisa-tutorial/cover.jpg - will work
 * /kaisa-tutorial/images/igkaisa.jpg - won't work.
 * 
 * I'll change that in future, now I am gonning sleep, coz it's like 4:00 and
 * I have to get up at 6:50 to work, what I am doing with my life eh.
*/
app.get('/:slug/:asset', async (req, res, next) => {
	res.sendFile(
		join(process.cwd(), 'blog', req.params.slug, req.params.asset),
		err => {
			if (!err) return;
			next();
		}
	);
});

app.get('/api/blog', (req, res) => {
	const result =
		BLOG_DATA.posts
		.filter(p => !!(p.slug && p.title) === true)
		.map(p => {
			return {
				title: p.title,
				slug: p.slug,
				date: p.date || null,
				author: p.author || null,
				icon: p.icon || null
			}
		});
	return res.json(result);
})
app.get('/api/blog/:slug', (req, res) => {
	const post = BLOG_DATA.posts.find(post => post.slug === req.params.slug);
	if (post) {
		return res.json(post);
	} else {
		return res.status(404).json({
			status: 404,
			error: "Not found"
		});
	}
})
app.get('/api/authors/:author', (req, res) => {
	const author = BLOG_DATA.authors.find(author => author.id === req.params.author);
	if (author) {
		return res.json(author);
	} else {
		return res.status(404).json({
			status: 404,
			error: "Not found"
		});
	}
})

app.use(sapper.middleware());

app.listen(PORT);