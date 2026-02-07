import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from "@angular/common"; 
import { AuthService } from '../../services/auth.service';
import { IsLoggedService } from '../../services/is-logged.service';
import { ProjectsService, Project } from '../../services/projects.service';
import { ArticlesService, ArticleDto } from '../../services/articles.service';
import { Subscription } from 'rxjs';


interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  views: number;
  comments: number;
  shares: number;
}

interface CardItem {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  views: number;
  comments: number;
  shares: number;
}

@Component({
  selector: 'app-blog',
  imports: [NgIf, NgFor, NgClass, RouterLink],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class BlogComponent implements OnInit, OnDestroy {

  projects: Project[] = [];
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  displayCards: CardItem[] = [];
  recentBlog: CardItem | null = null;
  isAuthorized: boolean = false;

  categories: string[] = ['Website', 'Template', 'News'];
  selectedCategory: string = 'Website';

  private subscription: Subscription | null = null;
  private articlesSubscription: Subscription | null = null;
  showMenu = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private isLoggedService: IsLoggedService,
    private projectsService: ProjectsService,
    private articlesService: ArticlesService
  ) {}

  ngOnInit() {
    // Load data without requiring login
    // Load projects and articles for public viewing
    this.subscription = this.projectsService.projects$.subscribe(projects => {
      this.projects = [...projects].reverse();

      if (!this.articles.length) {
        this.displayCards = this.projects.map((p, i) => ({
          title: p.title,
          excerpt: 'Generative AI tools and cutting-edge technology are shaping the future of digital innovation.',
          image: p.image,
          category: (p.tech?.split('•')[0]?.trim() || 'Website'),
          views: 12 + i * 3,
          comments: 45 - i * 5,
          shares: 71 - i * 7,
        }));
        
        // Set the first blog as recent blog
        if (this.displayCards.length > 0) {
          this.recentBlog = this.displayCards[0];
        }
      }
    });

    // Check if user is authorized (email = ansar@gmail.com)
    this.auth.me().subscribe({
      next: (user) => {
        this.isAuthorized = user.email === 'ansar@gmail.com';
      },
      error: () => {
        this.isAuthorized = false;
      }
    });

    this.loadArticles(this.selectedCategory);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.articlesSubscription) {
      this.articlesSubscription.unsubscribe();
    }
  }

  logout() {
    this.auth.logout();
    this.isLoggedService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadArticles(category);
  }

  private loadArticles(category: string) {
    if (this.articlesSubscription) {
      this.articlesSubscription.unsubscribe();
    }

    this.articlesSubscription = this.articlesService.getArticles(category).subscribe({
      next: (articles: ArticleDto[]) => {
        const mapped = articles.map(a => ({
          title: a.title,
          excerpt: a.excerpt,
          image: a.image,
          category: a.category,
          views: a.views,
          comments: a.comments,
          shares: a.shares,
        }));

        if (mapped.length) {
          this.displayCards = mapped;
          // Update recent blog to the first article
          this.recentBlog = mapped[0];
        }
      },
      error: () => {
        // fallback: keep current displayCards (usually from projects)
      },
    });
  }

  scrollToProject() {
    const projectSection = document.getElementById('project');
    if (projectSection) {
      projectSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
