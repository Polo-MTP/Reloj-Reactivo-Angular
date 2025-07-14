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
      colorLabel: ['#000000', Validators.required],
      colorManecillas: ['#000000', Validators.required],
      colorPuntos: ['#666666', Validators.required],
      colorNumeros: ['#000000', Validators.required],
      colorFondo: ['#ffffff', Validators.required],
    });
  }

  private cargarReloj(): void {
    if (!this.relojId) return;

    this.relojService.obtenerRelojPorId(this.relojId).subscribe((reloj) => {
      if (reloj) {
        this.relojOriginal = reloj;
        this.relojForm.patchValue({
          colorLabel: reloj.colorLabel,
          colorManecillas: reloj.colorManecillas,
          colorPuntos: reloj.colorPuntos,
          colorNumeros: reloj.colorNumeros,
          colorFondo: reloj.colorFondo,
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

  // Método para actualizar colores en tiempo real
  onColorChange(): void {
    if (this.relojForm.valid && this.relojId) {
      const datosColores = {
        colorLabel: this.relojForm.get('colorLabel')?.value,
        colorManecillas: this.relojForm.get('colorManecillas')?.value,
        colorPuntos: this.relojForm.get('colorPuntos')?.value,
        colorNumeros: this.relojForm.get('colorNumeros')?.value,
        colorFondo: this.relojForm.get('colorFondo')?.value,
      };
      
      this.relojService.actualizarReloj(this.relojId, datosColores);
    }
  }
}
