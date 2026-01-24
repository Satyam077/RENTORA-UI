import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Plans } from '../../../core/models/plans.model';
import { Features } from '../../../core/models/features.model';
import { PlansService } from '../../../core/services/plans.service';
import { FeaturesService } from '../../../core/services/features.service';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent implements OnInit {
  plans: Plans[] = [];
  features: Features[] = [];

  showModal = false;
  isEditMode = false;

  currentPlan: Plans = {
    planName: '',
    description: '',
    price: 0,
    yearlyDiscount: 0,
    isMarkedAsPopular: false,
    featureIds: []
  };

  constructor(
    private plansService: PlansService,
    private featuresService: FeaturesService
  ) { }

  ngOnInit(): void {
    this.loadPlans();
    this.loadFeatures();
  }

  loadPlans() {
    this.plansService.getAllPlans().subscribe({
      next: (data) => this.plans = data,
      error: (err) => console.error('Error loading plans', err)
    });
  }

  loadFeatures() {
    this.featuresService.getAllFeatures().subscribe({
      next: (data) => this.features = data,
      error: (err) => console.error('Error loading features', err)
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentPlan = {
      planName: '',
      description: '',
      price: 0,
      yearlyDiscount: 0,
      isMarkedAsPopular: false,
      featureIds: []
    };
    this.showModal = true;
  }

  openEditModal(plan: Plans) {
    this.isEditMode = true;
    this.currentPlan = { ...plan };
    // Map existing feature objects to IDs for selection state
    this.currentPlan.featureIds = plan.features?.map(f => f.id!) || [];
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
  getSortedFeatures(features: Features[]) {
  const categoryOrder = [
    'core',
    'management',
    'communication',
    'analytics',
    'integration'
  ];

  return [...features].sort((a, b) => {
    return (
      categoryOrder.indexOf(a.category.toLowerCase()) -
      categoryOrder.indexOf(b.category.toLowerCase())
    );
  });
}

  toggleFeature(featureId: string) {
    if (!this.currentPlan.featureIds) {
      this.currentPlan.featureIds = [];
    }

    const index = this.currentPlan.featureIds.indexOf(featureId);
    if (index > -1) {
      this.currentPlan.featureIds.splice(index, 1);
    } else {
      this.currentPlan.featureIds.push(featureId);
    }
  }

  isFeatureSelected(featureId: string): boolean {
    return this.currentPlan.featureIds?.includes(featureId) || false;
  }

  savePlan() {
    this.plansService.upsertPlan(this.currentPlan).subscribe({
      next: () => {
        this.loadPlans();
        this.closeModal();
      },
      error: (err) => console.error('Error saving plan', err)
    });
  }

  deletePlan(id: string) {
    if (confirm('Are you sure you want to delete this plan?')) {
      this.plansService.deletePlan(id).subscribe({
        next: () => this.loadPlans(),
        error: (err) => console.error('Error deleting plan', err)
      });
    }
  }
}
