import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { HojasVidaService } from './hojas-vida.service';
import { HojaVida } from '../../shared/models/hoja-vida.model';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-hojas-vida-list',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, SlicePipe],
  templateUrl: './hojas-vida-list.component.html',
  styleUrl: './hojas-vida-list.component.scss'
})
export class HojasVidaListComponent implements OnInit {
  private readonly service = inject(HojasVidaService);

  protected cargando = signal(false);
  protected error = signal<string | null>(null);
  protected hojasVida = signal<HojaVida[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.listar().subscribe({
      next: data => { this.hojasVida.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar las hojas de vida.'); this.cargando.set(false); }
    });
  }
}
