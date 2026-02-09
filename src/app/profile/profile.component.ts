import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { IsLoggedService } from '../services/is-logged.service';
import { ProjectsService, Project } from '../services/projects.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {

  projects: Project[] = [];
  private subscription: Subscription | null = null;

  editingId: string | null = null;
  editProject = { title: '', tech: '', image: '' };
  isLoggedIn: boolean = false;
  showModal: boolean = false;

  // Detail modal for reading full blog
  showDetailModal: boolean = false;
  selectedProject: Project | null = null;

  constructor(
    private router: Router,
    private auth: AuthService,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    // Check if user is logged in
    this.isLoggedService.checkLoggedInStatus();
    this.isLoggedIn = this.isLoggedService.isLoggedIn;

    // Load projects without requiring login (can view profile data publicly)
    this.subscription = this.projectsService.projects$.subscribe(projects => {
      this.projects = [...projects].reverse();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  deleteProject(id: string) {
    if (!this.isLoggedIn) {
      alert('Please login to delete projects');
      this.router.navigate(['/login']);
      return;
    }
    if (confirm('Delete this project?')) {
      this.projectsService.deleteProject(id);
    }
  }

  startEdit(project: Project) {
    if (!this.isLoggedIn) {
      alert('Please login to edit projects');
      this.router.navigate(['/login']);
      return;
    }
    this.editingId = project._id || null;
    this.editProject = { title: project.title, tech: project.tech, image: project.image };
    this.showModal = true;
  }

  cancelEdit() {
    this.showModal = false;
    this.editingId = null;
    this.editProject = { title: '', tech: '', image: '' };
  }

  saveEdit() {
    if (!this.editProject.title || !this.editProject.tech || !this.editProject.image) {
      alert('Please fill in all fields: Title, Content, and Image');
      return;
    }

    // Check image size if image is present
    if (this.editProject.image && this.editProject.image.startsWith('data:')) {
      // Calculate base64 size in bytes
      const base64Size = (this.editProject.image.length * 3) / 4;
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (base64Size > maxSize) {
        alert('Image is too large. Please choose a smaller image (max 5MB).');
        return;
      }
    }

    // Verify user still has valid token
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Your session has expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.editingId) {
      // Update existing project
      this.projectsService.updateProject(
        this.editingId,
        this.editProject.title,
        this.editProject.tech,
        this.editProject.image
      );
    } else {
      // Create new project
      this.projectsService.addProject(
        this.editProject.title,
        this.editProject.tech,
        this.editProject.image || 'assets/default-project.jpg'
      );
    }

    // Close modal after a short delay to let API call complete
    setTimeout(() => {
      this.cancelEdit();
    }, 500);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size is too large. Please choose an image smaller than 5MB.');
      // Clear only the file input, not the entire form
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      // Compress image if it's too large
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize if image is too large
        const maxWidth = 1200;
        const maxHeight = 800;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        this.editProject.image = canvas.toDataURL('image/jpeg', 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  openNewProjectModal() {
    if (!this.isLoggedIn) {
      alert('Please login to create projects');
      this.router.navigate(['/login']);
      return;
    }
    this.showModal = true;
    this.editingId = null;
    this.editProject = { title: '', tech: '', image: '' };
  }

  logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

  viewBlogDetail(project: Project) {
    console.log('Opening blog detail:', project);
    this.selectedProject = project;
    this.showDetailModal = true;
    console.log('showDetailModal:', this.showDetailModal, 'selectedProject:', this.selectedProject);
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedProject = null;
  }

  showMenu = false;
  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}
