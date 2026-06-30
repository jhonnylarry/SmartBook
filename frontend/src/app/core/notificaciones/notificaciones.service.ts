import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CalendarioApiService } from '../api/calendario-api.service';
import { MensajeriaApiService } from '../api/mensajeria-api.service';
import { UsuarioApiService } from '../api/usuario-api.service';
import { AcademicoApiService } from '../api/academico-api.service';
import { AnotacionApiService } from '../api/anotacion-api.service';
import { PerfilPublico } from '../models/usuario.model';
import { NotaDTO } from '../models/academico.model';
import { AnotacionDTO } from '../models/anotacion.model';
import { TipoEvento } from '../models/calendario.model';
import { Notificacion } from './notificacion.model';

const TIPO_EVENTO_LABEL: Record<TipoEvento, string> = {
  CLASE: 'Clase',
  REUNION: 'Reunión',
  EVALUACION: 'Evaluación',
  FERIADO: 'Feriado',
  OTRO: 'Evento',
};

/**
 * Arma la lista de notificaciones para el Inicio de Docente/Estudiante a partir de
 * varias fuentes (calendario, mensajería y — solo alumno — avisos académicos).
 * Cada fuente se aísla con catchError para que una falla no rompa el panel completo.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly calendarioApi = inject(CalendarioApiService);
  private readonly mensajeriaApi = inject(MensajeriaApiService);
  private readonly usuarioApi = inject(UsuarioApiService);
  private readonly academicoApi = inject(AcademicoApiService);
  private readonly anotacionApi = inject(AnotacionApiService);

  /** Notificaciones para el Docente: próximos eventos de sus asignaturas + mensajes. */
  paraDocente(asignaturaIds: number[]): Observable<Notificacion[]> {
    return forkJoin({
      eventos: this.proximosEventos(asignaturaIds),
      mensajes: this.mensajesRecibidos(),
    }).pipe(map(({ eventos, mensajes }) => this.ordenar([...eventos, ...mensajes])));
  }

  /** Notificaciones para el Estudiante: eventos + mensajes + avisos académicos (notas/anotaciones). */
  paraEstudiante(asignaturaIds: number[]): Observable<Notificacion[]> {
    return forkJoin({
      eventos: this.proximosEventos(asignaturaIds),
      mensajes: this.mensajesRecibidos(),
      avisos: this.avisosAcademicos(),
    }).pipe(map(({ eventos, mensajes, avisos }) => this.ordenar([...eventos, ...mensajes, ...avisos])));
  }

  /** Notificaciones para el Apoderado: por ahora, sus mensajes recibidos. */
  paraApoderado(): Observable<Notificacion[]> {
    return this.mensajesRecibidos().pipe(map((m) => this.ordenar(m)));
  }

  /** Cantidad de mensajes recibidos sin leer (para el badge de la campana). */
  contarMensajesNoLeidos(): Observable<number> {
    return this.mensajeriaApi.recibidos().pipe(
      map((msgs) => msgs.filter((m) => !m.leido).length),
      catchError(() => of(0)),
    );
  }

  // ── Fuentes ──

  private proximosEventos(asignaturaIds: number[]): Observable<Notificacion[]> {
    return this.calendarioApi.feedAsignaturas(asignaturaIds).pipe(
      map((eventos) => {
        const corte = Date.now() - 12 * 60 * 60 * 1000; // incluye lo de hoy
        return eventos
          .filter((e) => new Date(e.fechaInicio).getTime() >= corte)
          .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
          .slice(0, 6)
          .map<Notificacion>((e) => ({
            tipo: 'evento',
            titulo: e.titulo,
            subtitulo: TIPO_EVENTO_LABEL[e.tipo],
            fecha: e.fechaInicio,
            futuro: true,
          }));
      }),
      catchError(() => of([] as Notificacion[])),
    );
  }

  private mensajesRecibidos(): Observable<Notificacion[]> {
    return this.mensajeriaApi.recibidos().pipe(
      switchMap((msgs) => {
        if (msgs.length === 0) return of([] as Notificacion[]);
        const ids = [...new Set(msgs.map((m) => m.idRemitente))];
        return this.usuarioApi.perfiles(ids).pipe(
          catchError(() => of([] as PerfilPublico[])),
          map((perfiles) => {
            const nombre = new Map(perfiles.map((p) => [p.id, p.username]));
            return msgs.slice(0, 8).map<Notificacion>((m) => ({
              tipo: 'mensaje',
              titulo: m.asunto,
              subtitulo: `De ${nombre.get(m.idRemitente) ?? 'Usuario #' + m.idRemitente}`,
              fecha: m.fechaEnvio,
              leido: m.leido,
              mensajeId: m.id,
            }));
          }),
        );
      }),
      catchError(() => of([] as Notificacion[])),
    );
  }

  private avisosAcademicos(): Observable<Notificacion[]> {
    return forkJoin({
      notas: this.academicoApi.notasMias().pipe(catchError(() => of([] as NotaDTO[]))),
      anotaciones: this.anotacionApi.mias().pipe(catchError(() => of([] as AnotacionDTO[]))),
    }).pipe(
      map(({ notas, anotaciones }) => {
        const nNotas = [...notas]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5)
          .map<Notificacion>((n) => ({
            tipo: 'nota',
            titulo: `Nueva calificación: ${n.calificacion.toFixed(1)}`,
            subtitulo: 'Se registró una nota en tu boletín',
          }));
        const nAnot = [...anotaciones]
          .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''))
          .slice(0, 5)
          .map<Notificacion>((a) => ({
            tipo: 'anotacion',
            titulo: a.tipo === 'POSITIVA' ? 'Anotación positiva' : 'Anotación negativa',
            subtitulo: a.descripcion,
            fecha: a.fecha,
          }));
        return [...nNotas, ...nAnot];
      }),
      catchError(() => of([] as Notificacion[])),
    );
  }

  /** Eventos próximos primero (ascendente); luego el resto, más reciente primero. */
  private ordenar(items: Notificacion[]): Notificacion[] {
    const futuros = items.filter((i) => i.futuro).sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''));
    const resto = items.filter((i) => !i.futuro).sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
    return [...futuros, ...resto];
  }
}
