const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Add ambient light and point light (Sun)
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffffff, 1.5, 1000);
scene.add(sunLight);

// Create Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('https://solarsystemscope.com/textures/download/2k_sun.jpg')
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data (simplified for Mars and Jupiter; add others similarly)
const planets = [
    {
        name: 'Mars',
        radius: 1.5,
        distance: 20,
        speed: 0.02,
        texture: 'https://solarsystemscope.com/textures/download/2k_mars.jpg',
        info: { type: 'Terrestrial', diameter: '6,792 km', orbitalPeriod: '687 days', fact: 'Olympus Mons' }
    },
    {
        name: 'Jupiter',
        radius: 4,
        distance: 40,
        speed: 0.01,
        texture: 'https://solarsystemscope.com/textures/download/2k_jupiter.jpg',
        info: { type: 'Gas Giant', diameter: '139,820 km', orbitalPeriod: '11.86 years', fact: 'Great Red Spot' }
    }
];

// Create planets and info panels
const planetMeshes = [];
const infoPanels = [];

planets.forEach(planet => {
    // Create planet
    const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(planet.texture)
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planet.distance;
    scene.add(mesh);
    planetMeshes.push({ mesh, distance: planet.distance, speed: planet.speed });

    // Create info panel (DOM element)
    const panel = document.createElement('div');
    panel.className = 'info-panel';
    panel.innerHTML = `
        <strong>${planet.name}</strong><br>
        Type: ${planet.info.type}<br>
        Diameter: ${planet.info.diameter}<br>
        Orbital Period: ${planet.info.orbitalPeriod}<br>
        Fact: ${planet.info.fact}
    `;
    document.body.appendChild(panel);
    infoPanels.push({ panel, planet: mesh });
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate planets around Sun
    planetMeshes.forEach((planet, i) => {
        const angle = Date.now() * planet.speed * 0.001;
        planet.mesh.position.x = planet.distance * Math.cos(angle);
        planet.mesh.position.z = planet.distance * Math.sin(angle);
        planet.mesh.rotation.y += 0.01; // Rotate planet on its axis
    });

    // Update info panel positions (project 3D to 2D)
    infoPanels.forEach(({ panel, planet }) => {
        const vector = planet.position.clone().project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        panel.style.transform = `translate(${x + 20}px, ${y - 20}px)`;
        panel.style.opacity = vector.z < 1 ? 1 : 0; // Hide if behind camera
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
