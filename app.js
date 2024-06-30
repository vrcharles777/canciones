const user = 'vrcharles777';
const repo = 'canciones';
const branch = 'main'; // Asegúrate de que esta es la rama correcta

async function fetchRepoContents(path = '') {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayFiles(data, path);
    } catch (error) {
        console.error('Error al obtener el contenido del repositorio:', error);
    }
}

function displayFiles(files, path) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Limpiar lista anterior
    files.forEach(file => {
        const li = document.createElement('li');
        if (file.type === 'dir') {
            li.innerHTML = `<strong>${file.name}/</strong>`;
            li.style.cursor = 'pointer';
            li.onclick = () => fetchRepoContents(file.path); // Navegar dentro de las carpetas
        } else {
            const fileName = file.name;
            let fileUrl = file.download_url;

            // Si es un archivo HTML, cambiar el URL para que apunte a GitHub Pages
            if (fileName.endsWith('.html')) {
                const cleanPath = path ? `${path}/` : '';
                fileUrl = `https://${user}.github.io/${repo}/${cleanPath}${fileName}`;
            }

            li.innerHTML = `<a href="${fileUrl}" target="_blank">${fileName}</a>`;
        }
        fileList.appendChild(li);
    });
}

// Inicializar
fetchRepoContents();
