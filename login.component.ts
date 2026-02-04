import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Company, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  companies: Company[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // ✅ FIXED: Match LoginRequest interface exactly
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],   // ✅ AuthService.LoginRequest.username
      password: ['', [Validators.required, Validators.minLength(3)]],
      companyID: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  loadCompanies(): void {
    this.authService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        console.log('Companies loaded:', companies);
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.errorMessage = 'Gagal memuat daftar company';
      }
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // ✅ PERFECT: Form value langsung match LoginRequest
      const credentials: LoginRequest = this.loginForm.value;
      console.log('🔐 Login credentials:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('✅ Login response:', response);
          
          if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Login error:', error);
          this.errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
        }
      });
    } else {
      console.log('Form invalid:', this.loginForm.errors);
      this.markFormGroupTouched();
    }
  }

  // Helper untuk show validation errors
  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
