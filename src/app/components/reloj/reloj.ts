import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, interval, map, combineLatest, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RelojService } from '../../services/reloj';
import { Reloj } from '../../models/reloj';
import { ModalEditarRelojComponent } from '../modal-editar-reloj/modal-editar-reloj';
import { ModalControlTiempoComponent } from '../modal-control-tiempo/modal-control-tiempo';

@Component({
  selector: 'app-reloj',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalEditarRelojComponent, ModalControlTiempoComponent],
  templateUrl: './reloj.html',
  styleUrl: './reloj.scss',
})
export class RelojComponent implements OnInit, OnDestroy {
  relojForm: FormGroup;
  relojes$: Observable<Reloj[]>;
  
  // Propiedades para el modal de edición
  modalVisible = false;
  relojEditandoId?: number;
  
  // Propiedades para el modal de control de tiempo
  modalControlTiempoVisible = false;
  relojControlTiempoId?: number;

  // Marcas para el reloj análogo
  marcasHoras: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  puntosMinutos: Array<{ x: number; y: number }> = [];
  numerosHoras: Array<{ x: number; y: number; numero: number }> = [];

  constructor(private fb: FormBuilder, private relojService: RelojService) {
    this.relojForm = this.crearFormulario();
    this.relojes$ = this.relojService.getRelojes();
    this.generarMarcasReloj();
  }

  ngOnInit(): void {
    // Inicializar observables y configuraciones necesarias
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones si es necesario
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      hora: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      minuto: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      segundo: [
        0,
        [Validators.required, Validators.min(0), Validators.max(59)],
      ],
      colorLabel: ['#000000', Validators.required],
      colorManecillas: ['#000000', Validators.required],
      colorPuntos: ['#666666', Validators.required],
      colorNumeros: ['#000000', Validators.required],
      colorFondo: ['#ffffff', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.relojForm.valid) {
      const datosReloj = this.relojForm.value;

      this.relojService.crearReloj(datosReloj);
      this.relojForm.reset();
      this.relojForm.patchValue({
        hora: 0,
        minuto: 0,
        segundo: 0,
        colorLabel: '#000000',
        colorManecillas: '#000000',
        colorPuntos: '#666666',
        colorNumeros: '#000000',
        colorFondo: '#ffffff',
      });
    }
  }

  editarReloj(id: number): void {
    this.relojEditandoId = id;
    this.modalVisible = true;
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.relojEditandoId = undefined;
  }

  onRelojActualizado(): void {
    // Método que se ejecuta cuando el reloj ha sido actualizado desde el modal
    // Aquí podrías agregar lógica adicional si es necesaria
  }

  // Métodos para el modal de control de tiempo
  abrirControlTiempo(id: number): void {
    this.relojControlTiempoId = id;
    this.modalControlTiempoVisible = true;
  }

  cerrarModalControlTiempo(): void {
    this.modalControlTiempoVisible = false;
    this.relojControlTiempoId = undefined;
  }

  eliminarReloj(id: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este reloj?')) {
      this.relojService.eliminarReloj(id);

      // Si estamos editando este reloj, cerrar el modal
      if (this.relojEditandoId === id) {
        this.cerrarModal();
      }
    }
  }

  obtenerHoraFormateada(id: number): Observable<string> {
    return combineLatest([
      this.relojService.obtenerHoraActual(id),
      interval(1000).pipe(startWith(0)),
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

  obtenerPosicionManecilla(
    id: number,
    tipo: 'hora' | 'minuto' | 'segundo'
  ): Observable<{ x: number; y: number }> {
    return combineLatest([
      this.relojService.obtenerHoraActual(id),
      interval(1000).pipe(startWith(0)),
    ]).pipe(
      map(([horaActual]) => {
        if (!horaActual) return { x: 100, y: 50 };

        let angulo = 0;
        let longitud = 0;

        switch (tipo) {
          case 'hora':
            angulo = (horaActual.hora % 12) * 30 + horaActual.minuto * 0.5 - 90;
            longitud = 50;
            break;
          case 'minuto':
            angulo = horaActual.minuto * 6 + horaActual.segundo * 0.1 - 90;
            longitud = 70;
            break;
          case 'segundo':
            angulo = horaActual.segundo * 6 - 90;
            longitud = 80;
            break;
        }

        const radianes = (angulo * Math.PI) / 180;
        const x = 100 + longitud * Math.cos(radianes);
        const y = 100 + longitud * Math.sin(radianes);

        return { x, y };
      })
    );
  }

  private generarMarcasReloj(): void {
    // Generar marcas de las horas (12 marcas principales)
    for (let i = 0; i < 12; i++) {
      const angulo = ((i * 30 - 90) * Math.PI) / 180;
      const x1 = 100 + 85 * Math.cos(angulo);
      const y1 = 100 + 85 * Math.sin(angulo);
      const x2 = 100 + 95 * Math.cos(angulo);
      const y2 = 100 + 95 * Math.sin(angulo);

      this.marcasHoras.push({ x1, y1, x2, y2 });
    }

    // Generar posiciones de los números (1-12)
    for (let i = 1; i <= 12; i++) {
      const angulo = ((i * 30 - 90) * Math.PI) / 180;
      const x = 100 + 75 * Math.cos(angulo);
      const y = 100 + 75 * Math.sin(angulo);

      this.numerosHoras.push({ x, y, numero: i });
    }

    // Generar puntos de los minutos (60 puntos pequeños)
    for (let i = 0; i < 60; i++) {
      if (i % 5 !== 0) {
        // Excluir las posiciones de las horas
        const angulo = ((i * 6 - 90) * Math.PI) / 180;
        const x = 100 + 90 * Math.cos(angulo);
        const y = 100 + 90 * Math.sin(angulo);

        this.puntosMinutos.push({ x, y });
      }
    }
  }
}
