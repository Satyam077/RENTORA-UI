import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Features } from '../../../core/models/features.model';
import { FeaturesService } from '../../../core/services/features.service';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css'
})
export class FeaturesComponent implements OnInit {
  features: Features[] = [];
  filteredFeatures: Features[] = [];
  categories: string[] = ['Core', 'Management', 'Communication', 'Analytics', 'Integration'];

  showModal = false;
  isEditMode = false;

  currentFeature: Features = {
    name: '',
    description: '',
    category: 'Core'
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private featuresService: FeaturesService) { }

  ngOnInit(): void {
    this.loadFeatures();
  }

  loadFeatures() {
    this.featuresService.getAllFeatures().subscribe({
      next: (data) => {
        this.features = data;
        this.groupedFeatures();
      },
      error: (err) => console.error('Error loading features', err)
    });
  }

  // Grouping/Filtering helper if needed, or just display by category
  groupedFeatures() {
    // For now we just use the list, sorting if needed
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentFeature = {
      name: '',
      description: '',
      category: 'Core'
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(feature: Features) {
    this.isEditMode = true;
    this.currentFeature = { ...feature };
    this.selectedFile = null;
    this.imagePreview = feature.imageUrl || null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  selectCategory(cat: string) {
    this.currentFeature.category = cat;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.currentFeature.imageFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveFeature() {
    if (this.isEditMode && this.currentFeature.id) {
      this.featuresService.updateFeature(this.currentFeature.id, this.currentFeature).subscribe({
        next: () => {
          this.loadFeatures();
          this.closeModal();
        },
        error: (err) => console.error('Error updating feature', err)
      });
    } else {
      this.featuresService.createFeature(this.currentFeature).subscribe({
        next: () => {
          this.loadFeatures();
          this.closeModal();
        },
        error: (err) => console.error('Error creating feature', err)
      });
    }
  }

  deleteFeature(id: string) {
    if (confirm('Are you sure you want to delete this feature?')) {
      this.featuresService.deleteFeature(id).subscribe({
        next: () => this.loadFeatures(),
        error: (err) => console.error('Error deleting feature', err)
      });
    }
  }

  getFeaturesByCategory(category: string): Features[] {
    return this.features.filter(f => f.category === category);
  }
}
