import { Component, input, output, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export interface TableColumn {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => string;
  class?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [SpinnerComponent, NgTemplateOutlet, SkeletonComponent],
  template: `
    <div class="overflow-hidden rounded-2xl border border-slate-100/80 bg-white h-full flex flex-col"
      style="box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);">

      @if (loading()) {
        <!-- Skeleton rows -->
        <div class="divide-y divide-slate-50">
          <!-- Header skeleton -->
          <div class="flex items-center gap-4 px-6 py-3 bg-slate-50/80">
            @for (_ of skeletonCols; track $index) {
              <div class="skeleton h-2.5 rounded-lg" [style.width]="$index === 0 ? '20%' : ($index === 1 ? '25%' : '15%')"></div>
            }
          </div>
          @for (_ of skeletonRows; track $index) {
            <app-skeleton variant="tableRow" />
          }
        </div>
      } @else if (rows().length === 0) {
        <!-- Estado vacío -->
        <div class="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg class="w-7 h-7 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-600">{{ emptyMessage() }}</p>
          <p class="text-xs text-slate-400 mt-1">No se encontraron registros</p>
        </div>
      } @else {
        <div class="flex-1 min-h-0 overflow-auto scrollbar-thin">
          <table class="min-w-full divide-y divide-slate-100">
            <!-- Header -->
            <thead>
              <tr style="background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);">
                @for (col of columns(); track col.key) {
                  <th
                    scope="col"
                    class="px-6 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider"
                    [class]="col.class ?? ''"
                  >
                    {{ col.label }}
                  </th>
                }
                @if (actionsTemplate()) {
                  <th scope="col" class="px-6 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                }
              </tr>
            </thead>

            <!-- Body con stagger -->
            <tbody class="bg-white divide-y divide-slate-50">
              @for (row of rows(); track $index; let i = $index) {
                <tr
                  class="group transition-colors duration-100 hover:bg-primary-50/40"
                  [class.cursor-pointer]="rowClickable()"
                  [style.animation]="'rowIn 0.35s cubic-bezier(0.22,1,0.36,1) ' + Math.min(i * 40, 400) + 'ms both'"
                  (click)="onRowClick(row)"
                >
                  @for (col of columns(); track col.key) {
                    <td
                      class="px-6 py-3.5 text-sm text-slate-700 whitespace-nowrap"
                      [class]="col.class ?? ''"
                    >
                      @if (col.render) {
                        {{ col.render(getCellValue(row, col.key), row) }}
                      } @else {
                        {{ getCellValue(row, col.key) }}
                      }
                    </td>
                  }
                  @if (actionsTemplate()) {
                    <td class="px-6 py-3.5 text-right whitespace-nowrap">
                      <ng-container
                        [ngTemplateOutlet]="actionsTemplate()!"
                        [ngTemplateOutletContext]="{ $implicit: row }"
                      ></ng-container>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class DataTableComponent {
  columns       = input.required<TableColumn[]>();
  rows          = input<Record<string, unknown>[]>([]);
  loading       = input<boolean>(false);
  emptyMessage  = input<string>('No hay registros para mostrar.');
  rowClickable  = input<boolean>(false);
  actionsTemplate = input<TemplateRef<unknown> | null>(null);

  rowClicked = output<Record<string, unknown>>();

  // Para stagger de animación en el template
  readonly Math = Math;

  readonly skeletonRows = [1, 2, 3, 4, 5];
  readonly skeletonCols = [1, 2, 3, 4, 5];

  getCellValue(row: Record<string, unknown>, key: string): unknown {
    return row[key];
  }

  onRowClick(row: Record<string, unknown>): void {
    if (this.rowClickable()) {
      this.rowClicked.emit(row);
    }
  }
}
