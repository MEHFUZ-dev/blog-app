import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface BlogPost {
  id: number;
  title: string;
  tech: string;
  image: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogJsonService {
  private blogs: BlogPost[] = [];

  constructor() {
    this.loadBlogs();
  }

  private loadBlogs() {
    fetch('/assets/data/blogs.json')
      .then(response => response.json())
      .then(data => {
        this.blogs = data;
      })
      .catch(error => {
        console.error('Error loading blogs:', error);
      });
  }

  getBlogs(): Observable<BlogPost[]> {
    return of(this.blogs);
  }

  getBlogById(id: number): Observable<BlogPost | undefined> {
    return of(this.blogs.find(blog => blog.id === id));
  }
}
