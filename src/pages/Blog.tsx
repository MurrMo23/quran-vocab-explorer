
import React from 'react';
import BlogList from '@/components/blog/BlogList';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { HUB_SEO } from '@/utils/seo-templates';
import SEO from '@/components/SEO';

const Blog = () => {
  return (
    <>
      <SEO 
        title={HUB_SEO.blog.title}
        description={HUB_SEO.blog.description}
        keywords={["Arabic blog", "language learning", "vocabulary tips", "Quranic Arabic", "educational content"]}
        url="https://quranvocab.com/blog"
        type="website"
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <header className="mb-8">
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Blog</h1>
              <p className="text-muted-foreground">
                Explore our articles about Arabic vocabulary, learning tips, and more.
              </p>
            </header>
            
            <BlogList />

          </div>
          <aside className="w-full md:w-1/4">
            <BlogSidebar />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Blog;
