import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { BullsEyeDiagramComponent } from './bulls-eye/bulls-eye-diagram/bulls-eye-diagram.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    BullsEyeDiagramComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  protected title = 'CardiologiaApp';
}
