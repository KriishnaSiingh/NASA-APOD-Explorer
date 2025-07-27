const fetchButton = document.getElementById('fetchButton');
const randomButton = document.getElementById('randomButton');
const hdToggle = document.getElementById('hdToggle');
const toggleTheme = document.getElementById('toggleTheme');
const datePicker = document.getElementById('datePicker');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const apodContent = document.getElementById('apodContent');
const title = document.getElementById('title');
const date = document.getElementById('date');
const mediaContainer = document.getElementById('mediaContainer');
const explanation = document.getElementById('explanation');
const themeContainer = document.getElementById('themeContainer');
const apiKey = 'DEMO_KEY';
let currentData = null;
let isHD = false;
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    opacity: Math.random()
}));
function animateStars() 
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        star.opacity += (Math.random() - 0.5) * 0.05;
        star.opacity = Math.max(0, Math.min(1, star.opacity));
    });
    requestAnimationFrame(animateStars);
}
animateStars();
const cachedAPOD = localStorage.getItem('apodData');
if (cachedAPOD) displayAPOD(JSON.parse(cachedAPOD));
async function fetchAPOD(date = '') {
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    apodContent.classList.add('hidden');
    mediaContainer.innerHTML = '';
    hdToggle.classList.add('hidden');
    try {
        const url = date
            ? `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`
            : `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch APOD');
        const data = await response.json();
        currentData = data;
        isHD = false;
        localStorage.setItem('apodData', JSON.stringify(data));
        displayAPOD(data);
    } catch (error) {
        errorDiv.innerHTML = `⚠️ ${error.message} <button class="underline ml-2" onclick="fetchAPOD('${date}')">Retry</button>`;
        errorDiv.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}
function displayAPOD(data)
{
    title.textContent = data.title;
    date.textContent = `📅 ${data.date}`;
    explanation.textContent = data.explanation;
    mediaContainer.innerHTML = '';
    if (data.media_type === 'image') {
        const imgUrl = isHD && data.hdurl ? data.hdurl : data.url;
        mediaContainer.innerHTML = `
            <img src="${imgUrl}" alt="${data.title}"
                 class="w-full h-auto rounded-lg shadow-md transform hover:scale-105 transition-all duration-300" />
        `;
        if (data.hdurl) hdToggle.classList.remove('hidden');
    } else if (data.media_type === 'video') {
        mediaContainer.innerHTML = `
            <iframe src="${data.url}" class="w-full h-96 rounded-lg shadow-md"
                    frameborder="0" allowfullscreen></iframe>
        `;
    } else {
        throw new Error('Unsupported media type');
    }

    apodContent.classList.remove('hidden');
}
function getRandomDate()
{
    const start = new Date('1995-06-16');
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}
toggleTheme.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
});
fetchButton.addEventListener('click', () => fetchAPOD(datePicker.value));
randomButton.addEventListener('click', () => fetchAPOD(getRandomDate()));
hdToggle.addEventListener('click', () => {
    isHD = !isHD;
    hdToggle.textContent = isHD ? 'View Standard' : 'View HD';
    displayAPOD(currentData);
});
