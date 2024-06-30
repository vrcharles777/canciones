const user = 'vrcharles777';
const repo = 'canciones';
const branch = 'main'; // Cambia esto si tu branch principal tiene otro nombre

async function fetchRepoContents() {
    const url = `https://api.github.com/repos/${user}/${repo}/contents/`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayFiles(data);
    } catch (error) {
        console.error('Error al obtener el contenido del repositorio:', error);
    }
}

function displayFiles(files) {
    const fileList = document.getElementById('file-list');
    files.forEach(file => {
        const li = document.createElement('li');
        if (file.type === 'dir') {
            li.innerHTML = `<strong>${file.name}/</strong>`;
        } else {
            li.innerHTML = `<a href="${file.download_url}" target="_blank">${file.name}</a>`;
        }
        fileList.appendChild(li);
    });
}

fetchRepoContents();
