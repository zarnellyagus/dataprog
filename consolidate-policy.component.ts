import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PolicyService, ConsolidatePolicy } from '../services/policy.service';

@Component({
  selector: 'app-consolidate-policy',
  standalone: false,
  templateUrl: './consolidate-policy.component.html',
  styleUrls: ['./consolidate-policy.component.scss']
})
export class ConsolidatePolicyComponent implements OnInit {
  searchForm: FormGroup;
  policies: ConsolidatePolicy[] = [];
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  
  // ✅ REMOVE: Math = Math; (penyebab template error)
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private policyService: PolicyService,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.searchForm = this.formBuilder.group({
      policyId: [''],
      appNo: ['']
    });
  }
 trackByPolicyId(index: number, item: any): any {
  return item.policyID || index;
}
  ngOnInit(): void {
    console.log('🌐 ConsolidatePolicy loaded');
    this.loadData(); // ✅ Pastikan initial load
  }

  /**
   * ✅ FIXED: Load data dengan loading state
   */
  loadData(): void {
    this.isLoading = true;
    console.log('📊 Loading page:', this.currentPage, 'search:', this.searchForm.value);
    
    const formValues = this.searchForm.value;
    this.policyService.getConsolidatePolicy(
      formValues.policyId || undefined,
      formValues.appNo || undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        console.log('✅ API Response:', response);
        this.policies = response.data || [];
        this.totalCount = response.totalCount || 0;
        this.totalPages = response.totalPages || Math.ceil((response.totalCount || 0) / this.pageSize);
        
        console.log('📈 Pagination:', {
          currentPage: this.currentPage,
          totalPages: this.totalPages,
          totalCount: this.totalCount,
          pageNumbers: this.getPageNumbers()
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading data:', error);
        this.policies = [];
        this.totalCount = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadData();
  }

  onReset(): void {
    this.searchForm.reset();
    this.currentPage = 1;
    this.loadData();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  /**
   * ✅ FIXED: getPageNumbers() - Handle totalPages=0
   */
  getPageNumbers(): number[] {
    if (this.totalPages <= 1) return []; // No pagination needed
    
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    // Adjust start if near end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    console.log('📄 Page numbers generated:', pages);
    return pages;
  }

  /**
   * ✅ FIXED: Safe navigation for pagination
   */
  goToPage(page: number): void {
    console.log('🔄 Go to page:', page);
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadData();
    }
  }

  viewPolicyDetail(policyId: string): void {
    console.log('👁️ View detail:', policyId);
    this.router.navigate(['/policy-detail', policyId]);
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '-';
  }
}
