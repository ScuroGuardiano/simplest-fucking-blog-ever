import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const blogDirectoryPath = join(process.cwd(), 'blog');

export let BLOG_DATA = {}

export function loadBlogData() {
    console.log('Starting loading blog data into memory...');

    let authors = [];
    let posts = [];

    try {
        const blogDir = readdirSync(blogDirectoryPath, { encoding: 'utf-8', withFileTypes: true });
        blogDir.forEach(current => {
            if (current.isDirectory()) {
                posts.push(loadPostFromDir(join(blogDirectoryPath, current.name)));
            }
        });
    }
    catch (err) {
        const error = new Error('Can\'t access blog directory, make sure it exists and process has permissions to it');
        error.details = err;
        throw error;
    }

    try {
        const authorsData = readFileSync(join(blogDirectoryPath, 'authors.json')).toString();
        authors = JSON.parse(authorsData);
    }
    catch(err) {
        console.warn('Can\'t access blog/authors.json file, no authors infomation loaded');
    }

    BLOG_DATA.authors = authors;
    BLOG_DATA.posts = posts;
    console.log('Loaded blog data into memory.');
}

function loadPostFromDir(dirPath) {
    try {
        const postString = readFileSync(join(dirPath, 'post.md')).toString();
        const postMetadata = matter(postString);
        return {
            content: postMetadata.content,
            ...postMetadata.data
        }
    }
    catch {
        return null;
    }
}