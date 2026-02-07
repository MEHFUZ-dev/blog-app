import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';

export interface Project {
id: any|string;
  _id?: string;
  title: string;
  tech: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private API = `${API_BASE_URL}/projects`;

  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProjects();
  }

  loadProjects() {
    this.http.get<Project[]>(this.API)
      .subscribe({
        next: (data) => {
          console.log('Projects loaded:', data);
          this.projectsSubject.next(data);
        },
        error: (err) => {
          console.error('Error loading projects:', err);
        }
      });
  }

  addProject(title: string, tech: string, image: string) {
    this.http.post<Project>(this.API, { title, tech, image })
      .subscribe({
        next: (newProject) => {
          console.log('Project created:', newProject);
          this.loadProjects();
        },
        error: (err) => {
          console.error('Error creating project:', err);
          alert('Failed to create project: ' + (err?.error?.error || err.message));
        }
      });
  }

  updateProject(id: string, title: string, tech: string, image: string) {
    this.http.put<Project>(`${this.API}/${id}`, { title, tech, image })
      .subscribe({
        next: (updatedProject) => {
          console.log('Project updated:', updatedProject);
          this.loadProjects();
        },
        error: (err) => {
          console.error('Error updating project:', err);
          alert('Failed to update project: ' + (err?.error?.error || err.message));
        }
      });
  }

  deleteProject(id: string) {
    this.http.delete(`${this.API}/${id}`)
      .subscribe({
        next: () => {
          console.log('Project deleted');
          this.loadProjects();
        },
        error: (err) => {
          console.error('Error deleting project:', err);
          alert('Failed to delete project: ' + (err?.error?.error || err.message));
        }
      });
  }
}
