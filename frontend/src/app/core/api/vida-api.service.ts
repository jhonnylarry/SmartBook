import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  HojaVidaEstudianteDTO, AgregarHojaVida, ActualizarHojaVida,
  AntecedenteAcademicoDTO, AgregarAntecedenteAcademico, ActualizarAntecedenteAcademico,
  AntecedenteFamiliarDTO, AgregarAntecedenteFamiliar, ActualizarAntecedenteFamiliar,
  AntecedenteMedicoDTO, AgregarAntecedenteMedico, ActualizarAntecedenteMedico,
  DocumentoAdjuntoDTO, AgregarDocumentoAdjunto, ActualizarDocumentoAdjunto,
} from '../models/vida-estudiante.model';

/**
 * API · Hoja de vida del estudiante → microservicio vida-estudiante · puerto 5005 · DB smartbook_vida.
 * Gateway (/api/v1/...): hojas-vida · antecedentes-academicos · -familiares · -medicos · documentos-adjuntos.
 * Backend: carpeta vida-estudiante/.
 */
@Injectable({ providedIn: 'root' })
export class VidaApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  // ── Hoja de Vida ──
  hojaPorEstudiante(idEstudiante: number): Observable<HojaVidaEstudianteDTO[]> {
    return this.http.get<HojaVidaEstudianteDTO[]>(`${this.api}/hojas-vida/estudiante/${idEstudiante}`);
  }
  crearHoja(body: AgregarHojaVida): Observable<HojaVidaEstudianteDTO> {
    return this.http.post<HojaVidaEstudianteDTO>(`${this.api}/hojas-vida`, body);
  }
  actualizarHoja(id: number, body: ActualizarHojaVida): Observable<HojaVidaEstudianteDTO> {
    return this.http.put<HojaVidaEstudianteDTO>(`${this.api}/hojas-vida/${id}`, body);
  }

  // ── Antecedentes Académicos ──
  academicosPorHoja(idHojaVida: number): Observable<AntecedenteAcademicoDTO[]> {
    return this.http.get<AntecedenteAcademicoDTO[]>(`${this.api}/antecedentes-academicos/hoja-vida/${idHojaVida}`);
  }
  crearAcademico(body: AgregarAntecedenteAcademico): Observable<AntecedenteAcademicoDTO> {
    return this.http.post<AntecedenteAcademicoDTO>(`${this.api}/antecedentes-academicos`, body);
  }
  actualizarAcademico(id: number, body: ActualizarAntecedenteAcademico): Observable<AntecedenteAcademicoDTO> {
    return this.http.put<AntecedenteAcademicoDTO>(`${this.api}/antecedentes-academicos/${id}`, body);
  }
  eliminarAcademico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/antecedentes-academicos/${id}`);
  }

  // ── Antecedentes Familiares ──
  familiaresPorHoja(idHojaVida: number): Observable<AntecedenteFamiliarDTO[]> {
    return this.http.get<AntecedenteFamiliarDTO[]>(`${this.api}/antecedentes-familiares/hoja-vida/${idHojaVida}`);
  }
  crearFamiliar(body: AgregarAntecedenteFamiliar): Observable<AntecedenteFamiliarDTO> {
    return this.http.post<AntecedenteFamiliarDTO>(`${this.api}/antecedentes-familiares`, body);
  }
  actualizarFamiliar(id: number, body: ActualizarAntecedenteFamiliar): Observable<AntecedenteFamiliarDTO> {
    return this.http.put<AntecedenteFamiliarDTO>(`${this.api}/antecedentes-familiares/${id}`, body);
  }
  eliminarFamiliar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/antecedentes-familiares/${id}`);
  }

  // ── Antecedentes Médicos ──
  medicosPorHoja(idHojaVida: number): Observable<AntecedenteMedicoDTO[]> {
    return this.http.get<AntecedenteMedicoDTO[]>(`${this.api}/antecedentes-medicos/hoja-vida/${idHojaVida}`);
  }
  crearMedico(body: AgregarAntecedenteMedico): Observable<AntecedenteMedicoDTO> {
    return this.http.post<AntecedenteMedicoDTO>(`${this.api}/antecedentes-medicos`, body);
  }
  actualizarMedico(id: number, body: ActualizarAntecedenteMedico): Observable<AntecedenteMedicoDTO> {
    return this.http.put<AntecedenteMedicoDTO>(`${this.api}/antecedentes-medicos/${id}`, body);
  }
  eliminarMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/antecedentes-medicos/${id}`);
  }

  // ── Documentos Adjuntos ──
  documentosPorHoja(idHojaVida: number): Observable<DocumentoAdjuntoDTO[]> {
    return this.http.get<DocumentoAdjuntoDTO[]>(`${this.api}/documentos-adjuntos/hoja-vida/${idHojaVida}`);
  }
  crearDocumento(body: AgregarDocumentoAdjunto): Observable<DocumentoAdjuntoDTO> {
    return this.http.post<DocumentoAdjuntoDTO>(`${this.api}/documentos-adjuntos`, body);
  }
  actualizarDocumento(id: number, body: ActualizarDocumentoAdjunto): Observable<DocumentoAdjuntoDTO> {
    return this.http.put<DocumentoAdjuntoDTO>(`${this.api}/documentos-adjuntos/${id}`, body);
  }
  eliminarDocumento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/documentos-adjuntos/${id}`);
  }
}
