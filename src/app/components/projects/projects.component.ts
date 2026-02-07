import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-projects',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {

  @Input() projects!: any[];
  @Input() role!: string;
  selectedProjectId: string | null = null;

  projects1: any[] = [];
  editingIndex: number | null = null;
  editProject = { title: '', tech: '', image: '' };

  constructor(private route: ActivatedRoute, private projectsService: ProjectsService) {}

  ngOnInit() {
    // Get project ID from route params if available
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedProjectId = params['id'];
      }
    });

    // Load projects from backend
    this.projectsService.projects$.subscribe({
      next: (projects) => {
        this.projects1 = projects;
      }
    });
  }

  addProject(title: string, tech: string, image: string) {
    if (title && tech && image) {
      this.projectsService.addProject(title, tech, image);
    }
  }

  deleteProject(index: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      const project = this.projects1[index];
      if (project._id) {
        this.projectsService.deleteProject(project._id);
      } else {
        this.projects1.splice(index, 1);
      }
    }
  }

  startEdit(index: number) {
    this.editingIndex = index;
    this.editProject = { ...this.projects1[index] };
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editProject = { title: '', tech: '', image: '' };
  }

  saveEdit() {
    if (this.editingIndex !== null) {
      const project = this.projects1[this.editingIndex];
      if (project._id) {
        this.projectsService.updateProject(project._id, this.editProject.title, this.editProject.tech, this.editProject.image);
      } else {
        this.projects1[this.editingIndex] = { ...this.editProject };
      }
      this.editingIndex = null;
      this.editProject = { title: '', tech: '', image: '' };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProject.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}