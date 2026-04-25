# KOKOS 

KOKOS es una aplicación web enfocada en la gestión de clientes, pólizas, renovaciones y seguimiento para agentes de seguros. 

---------------------------------------------------------------------------------------------------------------------------

##  Objetivo del Repositorio
Este repositorio busca:

- Permitir que cualquier desarrollador pueda clonar el proyecto fácilmente.
- Documentar el proyecto desde su inicio.

---------------------------------------------------------------------------------------------------------------------------

##  Tecnologías del proyecto

### Frontend
- HTML  
- CSS  
- JavaScript

### Backend
- Node.js  
- Express.js  
- MongoDB (local)
- Dependencias: `express`, `mongoose`, `cors`, `bcryptjs`, `jsonwebtoken`, `dotenv`

---------------------------------------------------------------------------------------------------------------------------

##  Cómo iniciar el Backend

### Requisitos previos
- [Node.js](https://nodejs.org/) instalado
- [MongoDB](https://www.mongodb.com/try/download/community) corriendo localmente

### Pasos

1. Entrar a la carpeta del backend:
```bash
cd backEnd
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear el archivo `.env` dentro de `/backEnd` con el siguiente contenido:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/kokos_db
JWT_SECRET=tu_clave_secreta_larga
```
> ⚠️ El archivo `.env` **no se sube a GitHub**. Cada desarrollador debe crearlo manualmente.

4. Iniciar el servidor:
```bash
npm start
```

El servidor corre en `http://localhost:5000`


---------------------------------------------------------------------------------------------------------------------------

##  Colaboradores
- Jairo Daniel Morales Arguello 2047839
- Rebeca Monserrat Carrillo Sanchez 1897743
---------------------------------------------------------------------------------------------------------------------------

##  Cómo Clonar Este Repositorio

Cualquier desarrollador puede clonar el proyecto con el siguiente comando:

```bash
git clone https://github.com/Jairo292/KOKOS_COMPANY.git