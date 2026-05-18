#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE smartbook_auth;
    CREATE DATABASE smartbook_estudiante;
    CREATE DATABASE smartbook_academica;
    CREATE DATABASE smartbook_anotacion;
    CREATE DATABASE smartbook_vida;
    CREATE DATABASE smartbook_calendario;
    CREATE DATABASE smartbook_mensajeria;
    CREATE DATABASE smartbook_reportes;
EOSQL

echo "✅ Bases de datos SmartBook creadas correctamente."
