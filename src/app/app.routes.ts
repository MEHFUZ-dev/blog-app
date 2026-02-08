import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { Home } from './components/home/home';
import { BlogComponent } from './pages/blog/blog';
import { AnsarGuard } from './services/ansar.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'blogs', component: BlogComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AnsarGuard] },
    { path: 'home', component: Home},
    { path: 'blog/:id', component: BlogComponent }

];
