# RVIA

Este proyecto fue creado con [Angular CLI](https://github.com/angular/angular-cli) en la versión 18.1.1.

## Tabla de Contenidos
- [Instalación](#instalación)
- [Uso](#uso)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/IlseChan/RVIA-Front.git
``` 
2. Navega al directorio del proyecto:
```bash
cd RVIA-Front
``` 
3. Instala las dependencias:
```bash
npm install
``` 

## Uso

Para iniciar la apliación en modo de desarrollo, ejecuta el comando:
```bash
ng serve
``` 
Luego, abre `http://localhost:4200` en tu navegador

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar 
* `ng serve`: Inicia la apliación en modo de desarrollo.
* `ng build`: Compila la aplicación para producción en la carpeta `dist/`.
* `ng test`: Ejecuta las pruebas unitarias

## Estructura del proyecto

Como breve descripción de la estructura del proyecto: 

```bash
public/
├── assets/images # Recursos estáticos
src/ 
├── app/ # Componentes y módulos de la aplicación 
│    ├── containers/ # Layouts para los módulos de aplicaciones y usuarios 
│    ├── helpers/ # Contiene el interceptor para el token 
│    ├── modules/ # Módulos de la aplicación 
│    │     ├── aplicaciones/ # Módulo de aplicaciones 
│    │     ├── auth/ # Módulo de autenticación 
│    │     ├── shared/ # Módulo compartido 
│    │     └── usuarios/ # Módulo de usuarios 
├── environments/ # Configuraciones de entorno 
├── index.html # Archivo HTML principal 
├── main.ts # Punto de entrada principal de la aplicación 
└── styles.scss # Estilos globales
```