import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

interface UsageEntry {
  count: number;
  last: number; // epoch ms del último uso
}

type UsageMap = Record<string, UsageEntry>;

/**
 * Sistema de gestión de uso: registra cuántas veces y cuándo se usa cada
 * sección/acción y calcula un ranking "frecency" (frecuencia + recencia).
 * Persiste en localStorage POR USUARIO. Auto-registra cada navegación.
 */
@Injectable({ providedIn: 'root' })
export class UsageTrackingService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Rutas de sección reconocidas (claves de tracking). */
  private readonly sectionRoutes = [
    '/director/dashboard',
    '/director/matricula',
    '/director/academico',
    '/director/estudiantes',
    '/director/anotaciones',
    '/director/hoja-vida',
    '/director/calendario',
    '/director/materias',
    '/director/usuarios',
  ];

  private readonly _usage = signal<UsageMap>(this.load());
  readonly usage = this._usage.asReadonly();

  constructor() {
    // Auto-registro: cada navegación cuenta para la sección correspondiente.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const key = this.toSectionKey(e.urlAfterRedirects || e.url);
        if (key) this.record(key);
      });
  }

  /** Registra un uso de la ruta dada (incrementa contador + recencia). */
  record(routeKey: string): void {
    const map = { ...this._usage() };
    const entry = map[routeKey] ?? { count: 0, last: 0 };
    map[routeKey] = { count: entry.count + 1, last: Date.now() };
    this._usage.set(map);
    this.save(map);
  }

  /** Devuelve las `n` rutas candidatas mejor rankeadas por frecency. */
  top(candidateRoutes: string[], n: number): string[] {
    const map = this._usage();
    return [...candidateRoutes]
      .sort((a, b) => {
        const sb = this.score(map[b]);
        const sa = this.score(map[a]);
        if (sb !== sa) return sb - sa;
        // desempate por recencia
        const lb = map[b]?.last ?? 0;
        const la = map[a]?.last ?? 0;
        if (lb !== la) return lb - la;
        // desempate por orden por defecto
        return candidateRoutes.indexOf(a) - candidateRoutes.indexOf(b);
      })
      .slice(0, n);
  }

  // ── Algoritmo frecency: frecuencia + bonus por recencia ──
  private score(entry?: UsageEntry): number {
    if (!entry) return 0;
    return entry.count + this.recencyBonus(entry.last);
  }

  private recencyBonus(last: number): number {
    if (!last) return 0;
    const age = Date.now() - last;
    const hour = 3_600_000;
    if (age <= hour) return 3;
    if (age <= 24 * hour) return 2;
    if (age <= 7 * 24 * hour) return 1;
    return 0;
  }

  private toSectionKey(url: string): string | null {
    return this.sectionRoutes.find((r) => url.startsWith(r)) ?? null;
  }

  // ── Persistencia por usuario ──
  private storageKey(): string {
    const id = this.auth.currentUser()?.id ?? 'anon';
    return `smartbook_usage_${id}`;
  }

  private load(): UsageMap {
    try {
      const raw = localStorage.getItem(this.storageKey());
      return raw ? (JSON.parse(raw) as UsageMap) : {};
    } catch {
      return {};
    }
  }

  private save(map: UsageMap): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(map));
    } catch {
      /* almacenamiento no disponible: ignorar */
    }
  }
}
