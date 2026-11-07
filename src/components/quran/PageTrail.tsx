import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/** Visible breadcrumb trail (Home is added first; the last item is the current page). */
const PageTrail: React.FC<{ items: { name: React.ReactNode; path: string }[] }> = ({ items }) => {
  const all = [{ name: 'Home' as React.ReactNode, path: '/' }, ...items];
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {all.map((item, i) => (
          <React.Fragment key={item.path}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {i === all.length - 1 ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path}>{item.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default PageTrail;
