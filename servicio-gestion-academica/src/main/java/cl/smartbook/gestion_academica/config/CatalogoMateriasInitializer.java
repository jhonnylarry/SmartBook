package cl.smartbook.gestion_academica.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.MateriaCatalogo;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.model.entity.NivelEnsenanza;
import cl.smartbook.gestion_academica.modulo_catalogo_materias.repository.MateriaCatalogoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class CatalogoMateriasInitializer implements CommandLineRunner {

    private final MateriaCatalogoRepository materiaCatalogoRepository;

    @Override
    public void run(String... args) {
        if (materiaCatalogoRepository.count() > 0) {
            return;
        }

        var materias = List.of(
                // BASICA
                materia("Lenguaje y Comunicación", NivelEnsenanza.BASICA, "Formación General"),
                materia("Matemática", NivelEnsenanza.BASICA, "Formación General"),
                materia("Historia, Geografía y Ciencias Sociales", NivelEnsenanza.BASICA, "Formación General"),
                materia("Ciencias Naturales", NivelEnsenanza.BASICA, "Formación General"),
                materia("Inglés", NivelEnsenanza.BASICA, "Formación General"),
                materia("Artes Visuales", NivelEnsenanza.BASICA, "Formación General"),
                materia("Música", NivelEnsenanza.BASICA, "Formación General"),
                materia("Educación Física y Salud", NivelEnsenanza.BASICA, "Formación General"),
                materia("Tecnología", NivelEnsenanza.BASICA, "Formación General"),
                materia("Orientación", NivelEnsenanza.BASICA, "Formación General"),
                materia("Religión", NivelEnsenanza.BASICA, "Formación General"),
                // MEDIA
                materia("Lengua y Literatura", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Matemática", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Historia, Geografía y Ciencias Sociales", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Educación Ciudadana", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Biología", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Física", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Química", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Inglés", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Filosofía", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Artes Visuales", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Música", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Educación Física y Salud", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Tecnología", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Orientación", NivelEnsenanza.MEDIA, "Formación General"),
                materia("Religión", NivelEnsenanza.MEDIA, "Formación General"),
                // TECNICO
                materia("Administración", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Contabilidad", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Ventas", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Programación", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Conectividad y Redes", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Electricidad", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Electrónica", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Mecánica Automotriz", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Mecánica Industrial", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Construcción", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Gastronomía", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Atención de Párvulos", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Atención de Enfermería", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Telecomunicaciones", NivelEnsenanza.TECNICO, "Técnico-Profesional"),
                materia("Agropecuaria", NivelEnsenanza.TECNICO, "Técnico-Profesional")
        );

        materiaCatalogoRepository.saveAll(materias);
        log.info("Catálogo de materias sembrado: {} materias", materias.size());
    }

    private MateriaCatalogo materia(String nombre, NivelEnsenanza nivel, String area) {
        var m = new MateriaCatalogo();
        m.setNombre(nombre);
        m.setNivel(nivel);
        m.setArea(area);
        return m;
    }
}
