import { svelte } from '@sveltejs/vite-plugin-svelte';

const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserPage = repo?.endsWith('.github.io');

export default {
  base: repo && !isUserPage ? `/${repo}/` : '/',
  plugins: [svelte()]
};
