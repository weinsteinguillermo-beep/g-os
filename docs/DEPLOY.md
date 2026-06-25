# Deploy De G-OS v0.1

## Objetivo

Publicar G-OS v0.1 como aplicacion web accesible desde cualquier dispositivo usando GitHub Pages.

## Opcion Principal: GitHub Pages

GitHub Pages es la opcion recomendada para v0.1 porque:

- es gratis;
- funciona muy bien con apps estaticas;
- no requiere backend;
- es simple de mantener;
- deja historial con Git;
- permite crecer luego hacia GitHub Actions, dominio propio o deploys mas avanzados.

## Estructura De Publicacion

El repositorio debe publicarse desde la raiz.

Archivos clave:

- `index.html`: redirige a `app/`.
- `app/index.html`: aplicacion principal.
- `app/manifest.json`: configuracion PWA.
- `app/icon.svg`: icono instalable.
- `.nojekyll`: evita procesamiento Jekyll.

## Pasos Para Publicar

## 1. Crear Repositorio En GitHub

Crear un repositorio llamado:

```text
g-os
```

Puede ser publico o privado. Para GitHub Pages gratuito, lo mas simple es repositorio publico.

## 2. Inicializar Git Local

Desde la carpeta `g-os`:

```bash
git init
git add .
git commit -m "Release G-OS v0.1"
git branch -M main
```

## 3. Conectar Con GitHub

Reemplazar `USUARIO` por el usuario u organizacion de GitHub:

```bash
git remote add origin https://github.com/USUARIO/g-os.git
git push -u origin main
```

## 4. Activar GitHub Pages

En GitHub:

1. Entrar al repositorio `g-os`.
2. Ir a `Settings`.
3. Ir a `Pages`.
4. En `Build and deployment`, elegir `Deploy from a branch`.
5. Branch: `main`.
6. Folder: `/root`.
7. Guardar.

## 5. URL Publica

GitHub Pages generara una URL con este formato:

```text
https://USUARIO.github.io/g-os/
```

La app abrira automaticamente `/app/`.

## Recomendacion Futura: Vercel

Vercel puede ser mejor mas adelante si G-OS evoluciona hacia:

- rutas dinamicas;
- backend liviano;
- autenticacion;
- previews por rama;
- despliegues automaticos mas sofisticados.

Para v0.1, GitHub Pages sigue siendo la mejor opcion por simplicidad.

## Actualizar Futuras Versiones

```bash
git add .
git commit -m "Update G-OS v0.1"
git push
```

GitHub Pages actualizara el sitio automaticamente.

## Tiempo Estimado De Deploy Posterior

Una vez configurado GitHub Pages, cada despliegue futuro deberia tomar entre 1 y 3 minutos.

