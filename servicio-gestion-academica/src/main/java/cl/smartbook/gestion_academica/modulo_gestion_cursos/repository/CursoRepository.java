package cl.smartbook.gestion_academica.modulo_gestion_cursos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cl.smartbook.gestion_academica.modulo_gestion_cursos.model.entity.Curso;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
}
