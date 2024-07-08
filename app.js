const user = 'vrcharles777';
const repo = 'canciones';
const branch = 'main'; // Asegúrate de que esta es la rama correcta
let currentPath = '';

async function fetchRepoContents(path = '') {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentPath = path;
        displayFiles(data, path);
    } catch (error) {
        console.error('Error al obtener el contenido del repositorio:', error);
    }
}

function displayFiles(files, path) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Limpiar lista anterior

    // Agregar enlace para volver a la carpeta anterior
    if (path) {
        const upLink = document.createElement('li');
        upLink.innerHTML = `<a href="#" onclick="goUp()">⬆️ Anterior</a>`;
        fileList.appendChild(upLink);
    }

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
        } else if (file.name.endsWith('.txt')) {
            li.innerHTML = `<a href="#" onclick="loadFileContent('${file.download_url}')">${file.name}</a>`;
        } else {
            li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
        }
        fileList.appendChild(li);
    });
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

function goUp() {
    const pathArray = currentPath.split('/');
    pathArray.pop();
    const newPath = pathArray.join('/');
    fetchRepoContents(newPath);
}

// Inicializar
fetchRepoContents();