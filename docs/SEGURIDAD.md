
# Registro de seguridad

## SEC-001: Vulnerabilidad en deepmerge-ts

**Fecha de revisión:** 30/10/2026  
**Estado:** Pendiente de corrección  
**Severidad reportada:** Alta

### Descripción

La auditoría de npm identifica una vulnerabilidad en
deepmerge-ts, relacionada con el agotamiento de la pila
al procesar estructuras de objetos recursivas.

Referencia:
https://github.com/advisories/GHSA-ggr8-5vv4-36mx

### Dependencias afectadas

- prisma: 6.19.3
- @prisma/config: 6.19.3
- deepmerge-ts: 7.1.5

### Evidencia

El comando `npm audit --omit=dev` reporta
3 vulnerabilidades de severidad alta en esta
cadena de dependencias.

### Decisión técnica

Se mantiene temporalmente Prisma 6.19.3 para
evitar introducir cambios incompatibles sin
realizar previamente una migración controlada.

No se ejecuta `npm audit fix --force`, ya que
npm propone actualizar Prisma a la versión 7.10.1,
lo que supone un cambio de versión mayor.

Esta decisión no corrige la vulnerabilidad.

### Acciones pendientes

1. Evaluar una actualización compatible de Prisma.
2. Revisar los cambios necesarios en la configuración.
3. Ejecutar pruebas automatizadas y de integración.
4. Repetir la auditoría de dependencias.
5. Resolver o mitigar el riesgo antes del despliegue
   en producción.

### Verificaciones realizadas

- Vitest: 14 pruebas superadas.
- TypeScript: sin errores.
- ESLint: sin errores.
