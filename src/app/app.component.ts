import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RentmizoAiComponent } from './shared/rentmizo-ai/rentmizo-ai.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RentmizoAiComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RENTMIZO-UI';
}
