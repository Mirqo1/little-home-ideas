import { getCollection } from 'astro:content';
export async function publishedArticles() { return (await getCollection('articles', ({data}) => data.reviewed && !data.draft && data.date <= new Date())).sort((a,b)=>b.data.date.valueOf()-a.data.date.valueOf() || a.id.localeCompare(b.id)); }
export const articleUrl = (id:string) => `/articles/${id}/`;
