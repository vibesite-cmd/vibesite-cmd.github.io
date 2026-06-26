let scene, camera, renderer;
let sphere, particles;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let isDragging = false;
let previousMouseX = 0, previousMouseY = 0;

function init() {
  const container = document.getElementById('container');

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xe8dcc8, 1.2, 100);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xdc2626, 0.8, 100);
  pointLight2.position.set(-5, -3, 3);
  scene.add(pointLight2);

  // Main Sphere (the "core")
  const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0xe8dcc8,
    emissive: 0x1a0d10,
    shininess: 30,
    wireframe: false
  });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  // Inner wireframe sphere for vibe
  const wireGeometry = new THREE.SphereGeometry(1.55, 24, 24);
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0xdc2626,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const wireSphere = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(wireSphere);

  // Particles around the sphere
  const particleCount = 180;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    const radius = 2.2 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i + 2] = radius * Math.cos(phi);

    // Colors in bone / crimson range
    const mix = Math.random();
    colors[i] = mix * 0.91 + (1 - mix) * 0.86;     // R
    colors[i + 1] = mix * 0.86 + (1 - mix) * 0.15; // G
    colors[i + 2] = mix * 0.78 + (1 - mix) * 0.15; // B
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
  });

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);

  // Initial render
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  if (isDragging) {
    const deltaMove = {
      x: event.clientX - previousMouseX,
      y: event.clientY - previousMouseY
    };

    targetRotationY += deltaMove.x * 0.005;
    targetRotationX += deltaMove.y * 0.005;

    // Clamp vertical rotation
    targetRotationX = Math.max(-1.2, Math.min(1.2, targetRotationX));

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;
  } else {
    // Subtle attraction when not dragging
    const rect = renderer.domElement.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }
}

function onMouseDown(event) {
  isDragging = true;
  previousMouseX = event.clientX;
  previousMouseY = event.clientY;
}

function onMouseUp() {
  isDragging = false;
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Smooth rotation
  sphere.rotation.y = sphere.rotation.y * 0.92 + targetRotationY * 0.08;
  sphere.rotation.x = sphere.rotation.x * 0.92 + targetRotationX * 0.08;

  // Gentle auto spin when not interacting
  if (!isDragging) {
    targetRotationY += 0.0015;
    sphere.rotation.y += 0.0008;
  }

  // Animate particles
  if (particles) {
    particles.rotation.y = time * 0.04;
    particles.rotation.x = Math.sin(time * 0.2) * 0.1;
  }

  // Subtle sphere pulse
  const pulse = Math.sin(time * 1.5) * 0.015 + 1;
  sphere.scale.set(pulse, pulse, pulse);

  renderer.render(scene, camera);
}

// Boot
window.addEventListener('DOMContentLoaded', () => {
  init();

  // Add floating back link if not present
  if (!document.querySelector('.back-link')) {
    const back = document.createElement('div');
    back.className = 'back-link';
    back.innerHTML = `<a href="/">← back to vibesite</a>`;
    document.body.appendChild(back);
  }
});
