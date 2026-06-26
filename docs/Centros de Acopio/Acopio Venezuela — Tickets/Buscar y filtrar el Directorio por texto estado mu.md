# Buscar y filtrar el Directorio por texto / estado / municipio

Alcance: Mínimo
Código: 3
Depende de: Esqueleto + lista pública del Directorio (Esqueleto%20+%20lista%20p%C3%BAblica%20del%20Directorio.md)
Estado: Listo para tomar
Historias: P1

## Qué construir

Búsqueda por texto y filtros por estado (entidad federal) y municipio sobre el Directorio público. Excluye centros ocultos. La búsqueda/listado debe seguir funcionando sin JS (degradación a navegación del servidor).

## Criterios de aceptación

- [ ]  Se puede buscar por texto y filtrar por estado y municipio.
- [ ]  El municipio depende del estado seleccionado.
- [ ]  No se muestran centros ocultos.
- [ ]  La lista se puede buscar/filtrar aunque el JS no cargue (ADR 0003).

## Bloqueada por

- Esqueleto + lista pública del Directorio