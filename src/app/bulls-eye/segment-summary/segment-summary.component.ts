import { Component, Input } from '@angular/core';
import { Segment } from '../segment.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-segment-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './segment-summary.component.html',
  styleUrls: ['./segment-summary.component.scss']
})
export class SegmentSummaryComponent {
  @Input() segment!: Segment;
}