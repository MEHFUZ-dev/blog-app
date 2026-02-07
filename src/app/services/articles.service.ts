import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface ArticleDto {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  views: number;
  comments: number;
  shares: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private http: HttpClient) {}

  getArticles(category?: string): Observable<ArticleDto[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<ArticleDto[]>(`${API_BASE_URL}/articles`, { params });
  }

  getArticle(id: string): Observable<ArticleDto> {
    return this.http.get<ArticleDto>(`${API_BASE_URL}/articles/${id}`);
  }

  createArticle(payload: Omit<ArticleDto, 'id'>): Observable<ArticleDto> {
    return this.http.post<ArticleDto>(`${API_BASE_URL}/articles`, payload);
  }

  updateArticle(id: string, payload: Partial<Omit<ArticleDto, 'id'>>): Observable<ArticleDto> {
    return this.http.put<ArticleDto>(`${API_BASE_URL}/articles/${id}`, payload);
  }

  deleteArticle(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_BASE_URL}/articles/${id}`);
  }
}
