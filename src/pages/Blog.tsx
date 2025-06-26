
import React from 'react';
import BlogList from '@/components/blog/BlogList';
import BlogSidebar from '@/components/blog/BlogSidebar';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import AdSidebar from '@/components/ads/AdSidebar';
import { Helmet } from 'react-helmet';

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog | Arabic Words</title>
        <meta name="description" content="Read our blog posts about Arabic vocabulary, learning tips, and more." />
        <meta property="og:title" content="Blog | Arabic Words" />
        <meta property="og:description" content="Read our blog posts about Arabic vocabulary, learning tips, and more." />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <header className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Blog</h1>
              <p className="text-muted-foreground">
                Explore our articles about Arabic vocabulary, learning tips, and more.
              </p>
            </header>
            
            <AdPlaceholder 
              adId="blog-top" 
              size="leaderboard"
              className="mx-auto mb-8"
            />
            
            <BlogList />
            
            <div className="mt-8">
              <AdPlaceholder 
                adId="blog-bottom" 
                size="leaderboard"
                className="mx-auto"
              />
            </div>
          </div>
          <aside className="w-full md:w-1/4">
            <BlogSidebar />
            <AdSidebar className="mt-8" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Blog;
