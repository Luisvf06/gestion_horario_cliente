# Aspectos generales

Las páginas principales se encuentran en el directorio pages, la principal es index.astro donde se encuentra importado el elemento login.vue. Está correctamente validado y securizado para que tras hacer login se redirija al archivo horario.astro y tras hacer logout desde cualquier otra página vuelva a index.astro

Todos los componentes de pages importan otros de vue, que se encuentran en el directorio components. Las únicas páginas que no importan componentes de vue son: horario.astro y guardiasHoy.astro, debido a que tras hacer la petición inicial al servidor, no vuelven a requerir JS por lo que no necesita de interoperabilidad continuada.

Los componentes que sí tienen importados componentes de vue, renderizan el html y css y al acceder a ellos, cargan también el JavaScript de los componentes vue que contienen.

Las peticiones que se usan en la aplicación son POST: login y crear mandar datos al servidor para crear registros en la base de datos; PATCH para alterar registros;  Delete, para eliminar registros. He prescindido de Put ya que es muy similar a un Patch y con este último puedo hacer lo mismo. La petición que predomina es GET ya que la he usado para hacer todas las peticiones a la base de datos a través del servidor.

## Aspectos secundarios

Los estilos se encuentran en el directorio layouts. Son básicamente los estilos que incluye Astro por defecto salvo algunas mofificaciones que incluí para, según yo mejorar la usabilidad, como por ejemplo el cambio de fuente por una responsive.

La navegación a través de la aplicación se articula a través de la barra de navegación, que en encuentra en el componente navbarvue.vue y es llamada en el archivo Layout.astro, de esta forma me he asegurado que sólo aparece para los usuarios logueados. 

## Validaciones y seguridad

En cuanto a validaciones, algunos ejemplos son que la contraseña a la hora de cambiarse requiere de al menos una longitud de 8 carácteres que debe incluir mayúscula, minúscula y un dígito. Otra validación es a la hora de crear ausencias, donde es imposible crear una ausencia de un día anterior al presente.

Por último hay secciones protegidas de la barra de navegación como son plantilla docente y faltas hoy, que sólo son accesibles para usuarios que tienen el rol admin.

## Explicación de variables y expresiones

A lo largo del proyecto, es evidente que el nombre de las variables y funciones es muy diferente, ya que cambia de estilo e idioma. Esto se debe a dos motivos, en primer lugar el uso parcial de Copilot, que recomienda texto y hace la escritura de código más rápida, y en segundo lugar el aprendizaje de buenas prácticas en la empresa, que me ha enseñado a escribir siempre los nombre de variables y funciones en ingles.

