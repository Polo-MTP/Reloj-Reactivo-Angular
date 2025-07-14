import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, map } from 'rxjs';
import { Reloj } from '../models/reloj';
@Injectable({
  providedIn: 'root',
})
export class RelojService {
  private relojesSubject = new BehaviorSubject<Reloj[]>([]);
  private intervalos = new Map<number, any>();
  private idCounter = 1;

  constructor() {}

  // Obtener todos los relojes
  getRelojes(): Observable<Reloj[]> {
    return this.relojesSubject.asObservable();
  }

  // Crear un nuevo reloj
  crearReloj(relojData: Omit<Reloj, 'id' | 'createdAt'>): Reloj {
    const nuevoReloj: Reloj = {
      ...relojData,
      id: this.idCounter++,
      createdAt: new Date(),
    };

    const relojesActuales = this.relojesSubject.getValue();
    this.relojesSubject.next([...relojesActuales, nuevoReloj]);

    // Iniciar el intervalo para este reloj
    this.iniciarIntervalo(nuevoReloj);

    return nuevoReloj;
  }

  // Actualizar un reloj existente
  actualizarReloj(id: number, datosActualizados: Partial<Reloj>): void {
    const relojesActuales = this.relojesSubject.getValue();
    const indiceReloj = relojesActuales.findIndex((r) => r.id === id);

    if (indiceReloj !== -1) {
      const relojActualizado = {
        ...relojesActuales[indiceReloj],
        ...datosActualizados,
        updatedAt: new Date(),
      };

      relojesActuales[indiceReloj] = relojActualizado;
      this.relojesSubject.next([...relojesActuales]);

      // Reiniciar el intervalo con la nueva hora
      this.detenerIntervalo(id);
      this.iniciarIntervalo(relojActualizado);
    }
  }

  // Obtener un reloj por ID
  obtenerRelojPorId(id: number): Observable<Reloj | undefined> {
    return this.relojesSubject.pipe(
      map((relojes) => relojes.find((r) => r.id === id))
    );
  }

  // Eliminar un reloj
  eliminarReloj(id: number): void {
    this.detenerIntervalo(id);
    const relojesActuales = this.relojesSubject.getValue();
    const relojesFiltrados = relojesActuales.filter((r) => r.id !== id);
    this.relojesSubject.next(relojesFiltrados);
  }

  // Obtener la hora actual de un reloj específico
  obtenerHoraActual(
    id: number
  ): Observable<{ hora: number; minuto: number; segundo: number } | null> {
    return this.obtenerRelojPorId(id).pipe(
      map((reloj) => {
        if (!reloj) return null;

        const ahora = new Date();
        const tiempoCreacion = reloj.createdAt.getTime();
        const tiempoActual = ahora.getTime();
        const diferenciaMilisegundos = tiempoActual - tiempoCreacion;

        // Calcular los segundos transcurridos
        const segundosTranscurridos = Math.floor(diferenciaMilisegundos / 1000);

        // Hora inicial del reloj
        let horaActual = reloj.hora;
        let minutoActual = reloj.minuto;
        let segundoActual = reloj.segundo;

        // Sumar los segundos transcurridos
        segundoActual += segundosTranscurridos;

        // Ajustar overflow de segundos
        while (segundoActual >= 60) {
          segundoActual -= 60;
          minutoActual++;
        }

        // Ajustar overflow de minutos
        while (minutoActual >= 60) {
          minutoActual -= 60;
          horaActual++;
        }

        // Ajustar overflow de horas
        while (horaActual >= 24) {
          horaActual -= 24;
        }

        return {
          hora: horaActual,
          minuto: minutoActual,
          segundo: segundoActual,
        };
      })
    );
  }

  private iniciarIntervalo(reloj: Reloj): void {
    const intervalo = interval(1000).subscribe(() => {
      // El cálculo se hace en tiempo real en obtenerHoraActual
      // Este intervalo solo sirve para disparar actualizaciones
    });

    this.intervalos.set(reloj.id, intervalo);
  }

  private detenerIntervalo(id: number): void {
    const intervalo = this.intervalos.get(id);
    if (intervalo) {
      intervalo.unsubscribe();
      this.intervalos.delete(id);
    }
  }

  // Adelantar un segundo al reloj específico
  adelantarSegundo(id: number): void {
    const relojesActuales = this.relojesSubject.getValue();
    const indiceReloj = relojesActuales.findIndex((r) => r.id === id);

    if (indiceReloj !== -1) {
      const reloj = relojesActuales[indiceReloj];
      
      // Calcular la nueva hora con un segundo adelantado
      let nuevaHora = reloj.hora;
      let nuevoMinuto = reloj.minuto;
      let nuevoSegundo = reloj.segundo + 1;

      // Ajustar overflow de segundos
      if (nuevoSegundo >= 60) {
        nuevoSegundo = 0;
        nuevoMinuto++;
      }

      // Ajustar overflow de minutos
      if (nuevoMinuto >= 60) {
        nuevoMinuto = 0;
        nuevaHora++;
      }

      // Ajustar overflow de horas
      if (nuevaHora >= 24) {
        nuevaHora = 0;
      }

      // Actualizar el reloj con la nueva hora
      const relojActualizado = {
        ...reloj,
        hora: nuevaHora,
        minuto: nuevoMinuto,
        segundo: nuevoSegundo,
        updatedAt: new Date(),
      };

      relojesActuales[indiceReloj] = relojActualizado;
      this.relojesSubject.next([...relojesActuales]);

      // Reiniciar el intervalo con la nueva hora
      this.detenerIntervalo(id);
      this.iniciarIntervalo(relojActualizado);
    }
  }

  // Retroceder un segundo al reloj específico
  retrocederSegundo(id: number): void {
    const relojesActuales = this.relojesSubject.getValue();
    const indiceReloj = relojesActuales.findIndex((r) => r.id === id);

    if (indiceReloj !== -1) {
      const reloj = relojesActuales[indiceReloj];
      
      // Calcular la nueva hora con un segundo retrocedido
      let nuevaHora = reloj.hora;
      let nuevoMinuto = reloj.minuto;
      let nuevoSegundo = reloj.segundo - 1;

      // Ajustar underflow de segundos
      if (nuevoSegundo < 0) {
        nuevoSegundo = 59;
        nuevoMinuto--;
      }

      // Ajustar underflow de minutos
      if (nuevoMinuto < 0) {
        nuevoMinuto = 59;
        nuevaHora--;
      }

      // Ajustar underflow de horas
      if (nuevaHora < 0) {
        nuevaHora = 23;
      }

      // Actualizar el reloj con la nueva hora
      const relojActualizado = {
        ...reloj,
        hora: nuevaHora,
        minuto: nuevoMinuto,
        segundo: nuevoSegundo,
        updatedAt: new Date(),
      };

      relojesActuales[indiceReloj] = relojActualizado;
      this.relojesSubject.next([...relojesActuales]);

      // Reiniciar el intervalo con la nueva hora
      this.detenerIntervalo(id);
      this.iniciarIntervalo(relojActualizado);
    }
  }


  // Limpiar todos los intervalos al destruir el servicio
  destruirTodos(): void {
    this.intervalos.forEach((intervalo) => intervalo.unsubscribe());
    this.intervalos.clear();
  }
}
