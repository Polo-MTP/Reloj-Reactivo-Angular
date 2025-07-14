import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelojService } from '../../services/reloj';
import { Observable, interval, combineLatest, map, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-control-tiempo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-control-tiempo.html',
  styleUrl: './modal-control-tiempo.scss',
})
export class ModalControlTiempoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible: boolean = false;
  @Input() relojId?: number;
  @Output() cerrar = new EventEmitter<void>();

  tiempoActual$?: Observable<string>;
  private subscription?: Subscription;

  constructor(private relojService: RelojService) {}

  ngOnInit(): void {
    // Configuración inicial si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.relojId) {
      this.iniciarObservacionTiempo();
    } else if (!this.visible) {
      this.detenerObservacionTiempo();
    }
  }

  ngOnDestroy(): void {
    this.detenerObservacionTiempo();
  }

  private iniciarObservacionTiempo(): void {
    if (!this.relojId) return;

    // Usar exactamente la misma lógica que el reloj principal
    this.tiempoActual$ = this.obtenerHoraFormateada(this.relojId);
  }

  obtenerHoraFormateada(id: number): Observable<string> {
    return combineLatest([
      this.relojService.obtenerHoraActual(id),
      interval(1000).pipe(startWith(0))
    ]).pipe(
      map(([horaActual]) => {
        if (!horaActual) return '00:00:00';

        const hora = horaActual.hora.toString().padStart(2, '0');
        const minuto = horaActual.minuto.toString().padStart(2, '0');
        const segundo = horaActual.segundo.toString().padStart(2, '0');

        return `${hora}:${minuto}:${segundo}`;
      })
    );
  }

  private detenerObservacionTiempo(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  adelantarSegundo(): void {
    if (!this.relojId) return;
    this.relojService.adelantarSegundo(this.relojId);
  }

  retrocederSegundo(): void {
    if (!this.relojId) return;
    this.relojService.retrocederSegundo(this.relojId);
  }

  cerrarModal(): void {
    this.visible = false;
    this.cerrar.emit();
    this.detenerObservacionTiempo();
  }

  // Método para cerrar modal al hacer clic en el backdrop
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }
}
