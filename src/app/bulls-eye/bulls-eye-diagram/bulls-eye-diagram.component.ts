import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { Segment, BULLSEYE_SEGMENTS } from '../segment.model';
import { SegmentSummaryComponent } from '../segment-summary/segment-summary.component';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-bulls-eye-diagram',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    SegmentSummaryComponent
  ],
  templateUrl: './bulls-eye-diagram.component.html',
  styleUrls: ['./bulls-eye-diagram.component.scss']
})
export class BullsEyeDiagramComponent implements OnInit, AfterViewInit {
  /** Primera sección (white→blue→yellow→red) */
  @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<HTMLDivElement>;
  /** Segunda sección (white↔purple) */
  @ViewChild('svgContainer2', { static: true }) svgContainer2!: ElementRef<HTMLDivElement>;

  segments1: Segment[] = JSON.parse(JSON.stringify(BULLSEYE_SEGMENTS));
  segments2: { id: number; color: 'white' | 'purple' }[] =
    BULLSEYE_SEGMENTS.map(s => ({ id: s.id, color: 'white' }));

  patientName = '';
  selectedSegment: Segment | null = null;

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Carga SVG ÚNICO, que luego inyectaremos dos veces
    this.http.get('assets/bullseye1.svg', { responseType: 'text' })
      .subscribe(svgText => {
        // Inyecta copia en la sección 1
        this.svgContainer.nativeElement.innerHTML = svgText;
        // …y en la sección 2
        this.svgContainer2.nativeElement.innerHTML = svgText;

        this.attachListeners1();
        this.attachListeners2();
      });
  }

  exportDiagram(section: 1 | 2) {
    const container = section === 1
      ? this.svgContainer.nativeElement
      : this.svgContainer2.nativeElement;
    const svgEl = container.querySelector<SVGSVGElement>('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    let svgText = serializer.serializeToString(svgEl);
    if (!svgText.match(/^<svg[^>]+xmlns="http/)) {
      svgText = svgText.replace(
        /^<svg/,
        `<svg xmlns="http://www.w3.org/2000/svg"`
      );
    }

    const img = new Image();
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Dimensiones originales del SVG
      const svgW = svgEl.viewBox.baseVal.width;
      const svgH = svgEl.viewBox.baseVal.height;

      // Datos de leyenda según sección
      interface LegendItem { color: string; label: string; count: number; }
      let legend: LegendItem[];
      if (section === 1) {
        legend = [
          { color: 'blue', label: 'Diskinesia', count: this.countBy1('blue') },
          { color: 'yellow', label: 'Hipokinesia', count: this.countBy1('yellow') },
          { color: 'red', label: 'Akinesia', count: this.countBy1('red') }
        ];
      } else {
        legend = [
          { color: 'white', label: 'No alterado', count: this.countBy2('white') },
          { color: 'purple', label: 'Alterado', count: this.countBy2('purple') }
        ];
      }

      // Calcula altura extra para la leyenda
      const legendHeight = 30;
      const padding = 10;

      // Crea el canvas con espacio extra
      const canvas = document.createElement('canvas');
      canvas.width = svgW;
      canvas.height = svgH + legendHeight + padding;
      const ctx = canvas.getContext('2d')!;

      // Fondo blanco
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibuja el SVG
      ctx.drawImage(img, 0, 0, svgW, svgH);
      URL.revokeObjectURL(url);

      // Estilo de texto
      ctx.font = '16px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000';

      // Espacio horizontal entre ítems
      const total = legend.length;
      const segmentWidth = svgW / total;

      // Pintar cada entrada de leyenda
      legend.forEach((item, i) => {
        const x0 = segmentWidth * i + padding;
        const y0 = svgH + padding + legendHeight / 2;

        // Recuadro de color
        const boxSize = 12;
        ctx.fillStyle = item.color;
        ctx.fillRect(x0, y0 - boxSize / 2, boxSize, boxSize);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x0, y0 - boxSize / 2, boxSize, boxSize);

        // Texto: etiqueta + conteo
        ctx.fillStyle = '#000';
        const text = `${item.label}: ${item.count}`;
        ctx.fillText(text, x0 + boxSize + 6, y0);
      });

      // Nombre de archivo
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const datePart = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
      const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}`;
      const prefix = section === 1 ? 'diagramabullseye' : 'diagramaalteracion';
      const filename = `${prefix}_${datePart}_${timePart}.png`;

      // Forzar descarga
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    img.src = url;
  }

  ngAfterViewInit(): void { }

  /** Sección 1: white→blue→yellow→red */
  private attachListeners1() {
    const svgEl = this.svgContainer.nativeElement.querySelector('svg');
    if (!svgEl) return;

    this.segments1.forEach(seg => {
      const path = svgEl.querySelector<SVGElement>('#seg' + seg.id);
      if (!path) return;
      path.removeAttribute('style');
      path.style.fill = seg.color;
      path.style.stroke = '#000';
      path.style.cursor = 'pointer';

      const handler = () => this.ngZone.run(() => {
        this.toggleSegment1(seg, path);
      });
      path.addEventListener('click', handler);
      path.addEventListener('touchstart', handler);
    });
  }

  private toggleSegment1(seg: Segment, svgElem: SVGElement) {
    this.selectedSegment = seg;
    const order: Segment['color'][] = ['white', 'blue', 'yellow', 'red'];
    const next = order[(order.indexOf(seg.color) + 1) % order.length];
    seg.color = next;
    svgElem.style.fill = next;
    this.cdr.detectChanges();
  }

  countBy1(color: Segment['color']): number {
    return this.segments1.filter(s => s.color === color).length;
  }

  /** Sección 2: white ↔ purple */
  private attachListeners2() {
    const svgEl2 = this.svgContainer2.nativeElement.querySelector('svg');
    if (!svgEl2) return;

    this.segments2.forEach(seg => {
      const path = svgEl2.querySelector<SVGElement>('#seg' + seg.id);
      if (!path) return;
      path.removeAttribute('style');
      path.style.fill = seg.color;
      path.style.stroke = '#000';
      path.style.cursor = 'pointer';

      const handler = () => this.ngZone.run(() => {
        this.toggleSegment2(seg, path);
      });
      path.addEventListener('click', handler);
      path.addEventListener('touchstart', handler);
    });
  }

  private toggleSegment2(seg: { id: number; color: 'white' | 'purple' }, svgElem: SVGElement) {
    // Sólo dos estados
    seg.color = seg.color === 'white' ? 'purple' : 'white';
    svgElem.style.fill = seg.color;
    this.cdr.detectChanges();
  }

  countBy2(color: 'white' | 'purple'): number {
    return this.segments2.filter(s => s.color === color).length;
  }
}
