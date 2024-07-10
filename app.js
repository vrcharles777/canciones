const user = 'vrcharles777';
const repo = 'canciones';
const branch = 'main'; // Asegúrate de que esta es la rama correcta
let currentPath = '';

document.getElementById('clear-favorites-button').onclick = clearFavorites;
document.getElementById('go-to-favorites-button').onclick = () => fetchRepoContents('Favoritos');

async function fetchRepoContents(path = '') {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentPath = path;
        displayBreadcrumb(path);
        displayFiles(data, path);
    } catch (error) {
        console.error('Error al obtener el contenido del repositorio:', error);
    }
}

function displayBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = ''; // Limpiar ruta anterior
    const pathArray = path ? path.split('/') : [];
    
    // Crear botón para la raíz
    const rootButton = document.createElement('button');
    rootButton.innerText = 'Root';
    rootButton.onclick = () => fetchRepoContents('');
    breadcrumb.appendChild(rootButton);

    pathArray.forEach((folder, index) => {
        const button = document.createElement('button');
        button.innerText = folder;
        const newPath = pathArray.slice(0, index + 1).join('/');
        button.onclick = () => fetchRepoContents(newPath);
        breadcrumb.appendChild(button);
    });
}

function displayFiles(files, path) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Limpiar lista anterior

    files.forEach(file => {
        // Filtrar archivos .html y .js
        if (file.name.endsWith('.html') || file.name.endsWith('.js')) {
            return;
        }

        const li = document.createElement('li');
        
        if (file.type === 'dir') {
            li.innerHTML = `<strong>${file.name}/</strong>`;
            li.style.cursor = 'pointer';
            li.onclick = () => fetchRepoContents(file.path); // Navegar dentro de las carpetas
        } else {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = file.download_url;
            checkbox.onchange = () => toggleFavorite(file);

            if (file.name.endsWith('.txt')) {
                li.innerHTML = `<a href="#" onclick="loadFileContent('${file.download_url}')">${file.name}</a>`;
            } else {
                li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            }

            li.insertBefore(checkbox, li.firstChild);
        }

        fileList.appendChild(li);
    });

    updateFavorites();
}

function toggleFavorite(file) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const fileIndex = favorites.findIndex(fav => fav.path === file.path);

    if (fileIndex >= 0) {
        favorites.splice(fileIndex, 1);
    } else {
        favorites.push(file);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavorites();
}

function updateFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    const favoritesTitle = document.getElementById('favorites-title');
    favoritesList.innerHTML = ''; // Limpiar lista de favoritos

    // Mostrar favoritos solo si estamos en la carpeta Favoritos
    if (currentPath === 'Favoritos') {
        favoritesTitle.style.display = 'block';
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.forEach(file => {
            const li = document.createElement('li');
            if (file.name.endsWith('.txt')) {
                li.innerHTML = `<a href="#" onclick="loadFileContent('${file.download_url}')">${file.name}</a>`;
            } else {
                li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            }
            favoritesList.appendChild(li);
        });
    } else {
        favoritesTitle.style.display = 'none';
    }
}

async function loadFileContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        localStorage.setItem('fileContent', text);
        window.location.href = 'transponer.html';
    } catch (error) {
        console.error('Error al cargar el contenido del archivo:', error);
    }
}

function clearFavorites() {
    localStorage.removeItem('favorites');
    updateFavorites(); // Actualizar la lista de favoritos para reflejar los cambios
}

// Inicializar
fetchRepoContents();
