import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RelojService } from '../../services/reloj';
import { Reloj } from '../../models/reloj';

@Component({
  selector: 'app-modal-editar-reloj',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-editar-reloj.html',
  styleUrl: './modal-editar-reloj.scss',
})
export class ModalEditarRelojComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() relojId?: number;
  @Output() cerrar = new EventEmitter<void>();
  @Output() actualizado = new EventEmitter<void>();

  relojForm: FormGroup;
  relojOriginal?: Reloj;

  constructor(private fb: FormBuilder, private relojService: RelojService) {
    this.relojForm = this.crearFormulario();
  }

  ngOnInit(): void {
    // Configuración inicial si es necesaria
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.relojId) {
      this.cargarReloj();
    }
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      hora: [0, [Validators.required, Validators.min(0), Validators.max(23)]],
      minuto: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      segundo: [0, [Validators.required, Validators.min(0), Validators.max(59)]],
      colorLabel: ['#000000', Validators.required],
      colorManecillas: ['#000000', Validators.required],
      colorPuntos: ['#666666', Validators.required],
      colorNumeros: ['#000000', Validators.required],
    });
  }

  private cargarReloj(): void {
    if (!this.relojId) return;

    this.relojService.obtenerRelojPorId(this.relojId).subscribe((reloj) => {
      if (reloj) {
        this.relojOriginal = reloj;
        this.relojForm.patchValue({
          hora: reloj.hora,
          minuto: reloj.minuto,
          segundo: reloj.segundo,
          colorLabel: reloj.colorLabel,
          colorManecillas: reloj.colorManecillas,
          colorPuntos: reloj.colorPuntos,
          colorNumeros: reloj.colorNumeros,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.relojForm.valid && this.relojId) {
      const datosReloj = this.relojForm.value;
      this.relojService.actualizarReloj(this.relojId, datosReloj);
      this.actualizado.emit();
      this.cerrarModal();
    }
  }

  cerrarModal(): void {
    this.visible = false;
    this.cerrar.emit();
    this.resetearFormulario();
  }

  private resetearFormulario(): void {
    this.relojForm.reset();
    this.relojOriginal = undefined;
  }

  // Método para cerrar modal al hacer clic en el backdrop
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }
}
