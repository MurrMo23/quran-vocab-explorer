
import React from 'react';
import BlogList from '@/components/blog/BlogList';
import BlogSidebar from '@/components/blog/BlogSidebar';
import SEO from '@/components/SEO';

const Blog = () => {
  return (
    <>
      <SEO 
        title="Blog | Arabic Words"
        description="Read our blog posts about Arabic vocabulary, learning tips, and more. Expert insights on Quranic Arabic learning."
        keywords={["Arabic blog", "language learning", "vocabulary tips", "Quranic Arabic", "educational content"]}
        url="https://quranvocab.com/blog"
        type="website"
      />

      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Blog</h1>
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
