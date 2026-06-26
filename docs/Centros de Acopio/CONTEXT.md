# CONTEXT

# Acopio Venezuela

Sistema web para coordinar ayuda humanitaria tras el terremoto del 24/06/2026:
un directorio público de centros de acopio y un gestor de inventario para cada
centro. Sistema independiente; el inventario es el núcleo de valor y el
directorio existe para no depender de terceros.

## Lenguaje

**Centro de acopio**:
Lugar físico que recibe donaciones e insumos. Es la entidad central del
sistema: cada centro gestiona su ficha pública en el Directorio y su Inventario
privado.
*Evitar*: punto de recolección, sede, local.

**Directorio**:
Vista pública y de solo lectura de los centros de acopio y lo que necesitan.
Cualquier persona lo consulta sin cuenta. Es, en gran medida, una proyección de
los datos que cada centro mantiene.
*Evitar*: listado, mapa.

**Inventario**:
Libro privado de cada centro: un registro de los movimientos de insumos que
entran (de donantes) y salen (hacia entes del Estado). **No** mantiene un saldo
de existencias autoritativo; los totales son una conveniencia derivada y
etiquetada como “registrado”, no como “en existencia”. Solo visible para el
operador del centro.
*Evitar*: stock, almacén, bodega, existencias.

**Movimiento**:
Un evento del Inventario: una entrada o una salida. Lleva fecha y hora, el insumo
del catálogo, una cantidad opcional (número + unidad libre), el código que lo
registró (y por tanto su etiqueta) y una nota libre opcional.
*Evitar*: transacción, asiento, operación.

**Entrada**:
Movimiento que registra insumos recibidos de un donante.
*Evitar*: ingreso, recepción, donación.

**Salida**:
Movimiento que registra insumos entregados a un ente del Estado.
*Evitar*: egreso, despacho, entrega.

**Necesidad**:
Lo que un centro pide en su ficha. Sale de un catálogo controlado y puede ser un
**insumo** (bien) o un **no-bien** (p. ej. voluntarios de rescate, transporte).
Cada necesidad de la ficha lleva urgencia (`Urgente`/`Media`/`Leve`) y un detalle
libre opcional.
*Evitar*: requerimiento, pedido, demanda.

**Insumo**:
Necesidad que es un **bien** físico (agua potable, alimentos no perecederos,
medicamentos básicos, insumos médicos…). Es el subconjunto de necesidades que el
Inventario puede mover: solo los insumos tienen entradas y salidas; un no-bien
(voluntarios) no.
*Evitar*: artículo, producto, ítem, suministro.

**Catálogo**:
Vocabulario controlado de categorías de necesidad (insumos y no-bienes) que
gestiona el Moderador. Existe para que el filtro del Directorio funcione: si las
categorías fueran texto libre, “agua” / “Agua potable” / “agua embotellada”
romperían el filtro.
*Evitar*: lista, taxonomía, tipos.

**Donante**:
Persona u organización que lleva insumos a un centro. Origen de una entrada.
*Evitar*: contribuyente, aportante.

**Ente del Estado**:
Organismo gubernamental que retira insumos de un centro para distribuirlos.
Destino de una salida.
*Evitar*: autoridad, gobierno, institución.

## Acceso

**Código de gestión**:
Cadena opaca y aleatoria que da acceso a gestionar un centro. El rol que otorga
vive en el servidor, no dentro del código. Se puede dictar por voz o SMS. Lleva
una etiqueta libre y autodeclarada (no verificada) que su creador le asigna.
*Evitar*: contraseña, token, clave.

**Responsable de centro**:
Persona que posee el código raíz de un centro, generado al registrarlo. Edita
la ficha pública, registra entradas y salidas, crea y revoca códigos de
voluntario, y corrige o elimina cualquier registro del inventario.
*Evitar*: dueño, admin, encargado.

**Cargo del responsable**:
Relación del responsable con el centro: `Propietario`, `Socio`, `Director` o
`Gerente`. Dato interno (no público), puramente descriptivo. No confundir con el
**rol** de acceso (responsable vs voluntario), que es lo que da permisos.
*Evitar*: rol, puesto, posición.

**Voluntario**:
Persona con un código creado por el Responsable. Registra entradas y salidas y
consulta el inventario; puede corregir sus propios registros recientes, pero no
edita la ficha pública, no crea códigos ni toca registros ajenos.
*Evitar*: colaborador, ayudante, usuario.

**Moderador**:
Persona del equipo que opera la solución. Cuenta real (no código). Cura la
calidad del Directorio (aprobar/verificar, ocultar, fusionar duplicados) y
administra la plataforma (recuperar códigos raíz, catálogo de insumos, cuentas
de moderador, métricas).
*Evitar*: administrador, operador, staff.

**Contacto de emergencia**:
Teléfono útil en la emergencia (bomberos, hospitales, protección civil…) curado
por el Moderador y mostrado en la home. Contenido casi estático, ajeno al núcleo
de centros/inventario. Alcance deseable, no mínimo.
*Evitar*: directorio telefónico, ayuda.

## Estados del centro

**Estado de verificación**:
Confianza que la moderación deposita en un centro: `sin verificar` (recién
creado, visible pero sin sello), `verificado` (un moderador lo confirmó) u
`oculto` (retirado del Directorio por falso, duplicado o peligroso). Lo controla
el Moderador.
*Evitar*: aprobado, validado, activo.

**Estado de necesidad**:
Urgencia con que un centro necesita un insumo. Se marca **por insumo**:
`Urgente`, `Media` o `Leve`. El badge del centro en la tarjeta es derivado: toma
el nivel más alto de sus insumos (`Urgente` / `Atención media` / `Atención baja`)
o `Sin reporte` si no hay insumos. Eje independiente del Estado de verificación.
*Evitar*: prioridad, nivel, severidad.

**Vialidad**:
Estado del acceso vial a un centro, en texto libre (p. ej. “Transitable”). Dato
volátil: cambia con cada réplica. Campo opcional de la ficha.
*Evitar*: estado de acceso, accesibilidad.

**Estado (entidad federal)**:
División político-territorial de Venezuela (Miranda, Carabobo, Zulia…) donde se
ubica un centro. Se muestra en la ficha y alimenta el filtro del Directorio. Ojo:
no confundir con “estado de necesidad” ni “estado de verificación”.
*Evitar*: provincia, región, departamento.

## Artefactos

**Ficha**:
Perfil público de un centro en el Directorio: nombre, estado, municipio,
dirección, contacto y ubicación opcionales, vialidad, sello de verificación,
lista de insumos requeridos (cada uno con urgencia y detalle libre) y fecha de
última actualización. Lo edita el Responsable.
*Evitar*: perfil, página, entrada.

**Reporte**:
Resumen de la Ficha en texto plano, copiable al portapapeles con un toque, para
reenviar por WhatsApp o SMS. Funciona sin red una vez cargada la página. Es el
puente hacia quien no puede abrir el sitio.
*Evitar*: resumen, export, compartido.