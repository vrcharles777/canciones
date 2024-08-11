const user = 'vrcharles777';
const repo = 'canciones';
const branch = 'main';
let currentPath = '';

document.getElementById('clear-favorites-button').onclick = clearFavorites;
document.getElementById('go-to-favorites-button').onclick = () => fetchRepoContents('Favoritos');
document.getElementById('delete-selected-button').onclick = deleteSelected;

async function fetchRepoContents(path = '') {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentPath = path;
        localStorage.setItem('currentPath', path);
        displayBreadcrumb(path);
        displayFiles(data, path);
    } catch (error) {
        console.error('Error al obtener el contenido del repositorio:', error);
    }
}

function displayBreadcrumb(path) {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    const pathArray = path ? path.split('/') : [];
    
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
    fileList.innerHTML = '';

    files.forEach(file => {
        if (file.name.endsWith('.html') || file.name.endsWith('.js')) {
            return;
        }

        const li = document.createElement('li');
        
        if (file.type === 'dir') {
            li.innerHTML = `<strong>${file.name}/</strong>`;
            li.style.cursor = 'pointer';
            li.onclick = () => fetchRepoContents(file.path);
        } else {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = file.download_url;
            checkbox.onchange = () => toggleFavorite(file);

            if (currentPath === 'Favoritos') {
                checkbox.style.display = 'none';
            }

            if (file.name.endsWith('.txt')) {
                li.innerHTML = `<a href="#" onclick="loadFileContent('${file.download_url}', '${file.name}')">${file.name}</a>`;
            } else {
                li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            }

            li.insertBefore(checkbox, li.firstChild);
        }

        fileList.appendChild(li);
    });

    if (currentPath === 'Favoritos') {
        displayVirtualFiles();
    }

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
    favoritesList.innerHTML = '';

    if (currentPath === 'Favoritos') {
        favoritesTitle.style.display = 'block';
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.forEach(file => {
            const li = document.createElement('li');
            li.dataset.path = file.path;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'fileToDelete';
            radio.value = file.path;
            li.appendChild(radio);
            if (file.name.endsWith('.txt')) {
                li.innerHTML += `<a href="#" onclick="loadFileContent('${file.download_url}', '${file.name}')">${file.name}</a>`;
            } else {
                li.innerHTML += `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
            }
            favoritesList.appendChild(li);
        });

        displayVirtualFiles();
    } else {
        favoritesTitle.style.display = 'none';
    }
}

function displayVirtualFiles() {
    const favoritesList = document.getElementById('favorites-list');
    const virtualFiles = JSON.parse(localStorage.getItem('virtualFiles')) || [];
    
    virtualFiles.forEach(file => {
        const li = document.createElement('li');
        li.dataset.name = file.name;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'fileToDelete';
        radio.value = file.name;
        li.appendChild(radio);
        li.innerHTML += `<a href="#" onclick="loadVirtualFileContent('${file.name}')">${file.name}</a>`;
        favoritesList.appendChild(li);
    });
}

async function loadFileContent(url, fileName) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        localStorage.setItem('fileContent', text);
        localStorage.setItem('fileName', fileName);
        window.location.href = 'transponer.html';
    } catch (error) {
        console.error('Error al cargar el contenido del archivo:', error);
    }
}

function loadVirtualFileContent(fileName) {
    const virtualFiles = JSON.parse(localStorage.getItem('virtualFiles')) || [];
    const virtualFile = virtualFiles.find(file => file.name === fileName);

    if (virtualFile) {
        localStorage.setItem('fileContent', virtualFile.content);
        localStorage.setItem('fileName', virtualFile.name);
        window.location.href = 'transponer.html';
    }
}

function clearFavorites() {
    localStorage.removeItem('favorites');
    localStorage.removeItem('virtualFiles');
    updateFavorites();
}

function deleteSelected() {
    const selectedRadio = document.querySelector('input[name="fileToDelete"]:checked');
    
    if (selectedRadio) {
        const value = selectedRadio.value;
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        let virtualFiles = JSON.parse(localStorage.getItem('virtualFiles')) || [];
        
        favorites = favorites.filter(file => file.path !== value);
        virtualFiles = virtualFiles.filter(file => file.name !== value);
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('virtualFiles', JSON.stringify(virtualFiles));
        
        updateFavorites();
    } else {
        alert('Selecciona un archivo para eliminar.');
    }
}

// Inicializar
fetchRepoContents();
