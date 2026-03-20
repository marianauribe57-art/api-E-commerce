# E-commerce API

## Descripción del proyecto
API REST para gestionar los procesos de una tienda en línea. Permite administrar usuarios, categorías, productos, pedidos y detalles de pedidos. Desarrollada con Node.js, Express y SQLite.

## URL en producción
https://api-e-commercce.onrender.com/

## Autenticación
Header requerido: password: TuPasswordSegura2024

## Modelo de datos (Diagrama ER)
![diagrama E-R](https://github.com/user-attachments/assets/74f2b06b-3365-4488-bf1c-5444d3fdbbf9)


## Endpoints por tabla

### Categorias
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/categorias | Obtener todas las categorias |
| GET | /api/categorias/:id | Obtener categoria por ID |
| POST | /api/categorias | Crear nueva categoria |
| PUT | /api/categorias/:id | Actualizar categoria por ID |
| DELETE | /api/categorias/:id | Eliminar categoria por ID |

### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/usuarios | Obtener todos los usuarios |
| GET | /api/usuarios/:id | Obtener usuario por ID |
| POST | /api/usuarios | Crear nuevo usuario |
| PUT | /api/usuarios/:id | Actualizar usuario por ID |
| DELETE | /api/usuarios/:id | Eliminar usuario por ID |

### Productos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/productos | Obtener todos los productos |
| GET | /api/productos/:id | Obtener producto por ID |
| POST | /api/productos | Crear nuevo producto |
| PUT | /api/productos/:id | Actualizar producto por ID |
| DELETE | /api/productos/:id | Eliminar producto por ID |

### Pedidos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/pedidos | Obtener todos los pedidos |
| GET | /api/pedidos/:id | Obtener pedido por ID |
| POST | /api/pedidos | Crear nuevo pedido |
| PUT | /api/pedidos/:id | Actualizar pedido por ID |
| DELETE | /api/pedidos/:id | Eliminar pedido por ID |

### Detalle Pedido
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/detalle_pedido | Obtener todos los detalles |
| GET | /api/detalle_pedido/:id | Obtener detalle por ID |
| POST | /api/detalle_pedido | Crear nuevo detalle |
| PUT | /api/detalle_pedido/:id | Actualizar detalle por ID |
| DELETE | /api/detalle_pedido/:id | Eliminar detalle por ID |

## Tecnologías utilizadas
- Node.js
- Express
- SQLite3
- dotenv
- nodemon

## Instrucciones para correr localmente

1. Clonar el repositorio
```bash
git clone https://github.com/ismaelmira-dev/Api-E-Commercce
cd e-commerce-api
```

2. Instalar dependencias
```bash
npm install
```

3. Crear el archivo `.env` en la raíz del proyecto
```
PORT=3000
API_PASSWORD=TuPasswordSegura2024
```

4. Iniciar el servidor en desarrollo
```bash
npm run dev
```

5. Iniciar el servidor en producción
```bash
npm start
```

## Ejemplos de uso

### GET – Listar usuarios
```bash
curl https://mi-api.onrender.com/api/usuarios \
  -H "password: TuPasswordSegura2024"
```

### GET – Obtener usuario por ID
```bash
curl https://mi-api.onrender.com/api/usuarios/1 \
  -H "password: TuPasswordSegura2024"
```

### POST – Crear usuario
```bash
curl -X POST https://mi-api.onrender.com/api/usuarios \
  -H "password: TuPasswordSegura2024" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@email.com","rol":"cliente","activo":true}'
```

### GET – Filtrar productos por nombre
```bash
curl "https://mi-api.onrender.com/api/productos?nombre=iphone" \
  -H "password: TuPasswordSegura2024"
```

### POST – Crear pedido
```bash
curl -X POST https://mi-api.onrender.com/api/pedidos \
  -H "password: TuPasswordSegura2024" \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":1,"total":150000,"estado":"pendiente","fecha":"2026-03-20"}'
```

### DELETE – Eliminar una categoria
```bash
curl -X DELETE https://mi-api.onrender.com/api/categorias/1 \
  -H "password: TuPasswordSegura2024"
```

## Autores
- Mariana Uribe
- Ismael Mira
- Mariana Suarez

Servicio Nacional de Aprendizaje - SENA
Análisis y Desarrollo de Software
Ficha: 3229209
