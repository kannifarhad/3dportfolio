import * as THREE from 'three';

// import Stats from 'three/examples/jsm/libs/stats.module';

import * as dat from 'dat.gui';
import {
	OrbitControls
} from 'three/examples/jsm/controls/OrbitControls.js';
import {
	Water
} from 'three/examples/jsm/objects/Water';
import {
	GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { Water } from './shaders/Water';
import {
	Sky
} from './shaders/Sky.js';

let container, stats;
let camera, scene, renderer;
let controls, water, sun, mesh;


container = document.querySelector('div.container')

//

renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);

//

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
camera.position.set(30, 30, 100);

//

sun = new THREE.Vector3();

// Water
// Skybox

const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;

skyUniforms['turbidity'].value = 10;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const parameters = {
	elevation: 2,
	azimuth: 180
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);

function updateSun() {

	const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
	const theta = THREE.MathUtils.degToRad(parameters.azimuth);

	sun.setFromSphericalCoords(1, phi, theta);

	sky.material.uniforms['sunPosition'].value.copy(sun);

	scene.environment = pmremGenerator.fromScene(sky).texture;

}

updateSun();

//

const geometry = new THREE.BoxGeometry(30, 30, 30);
const material = new THREE.MeshStandardMaterial({
	roughness: 0
});

mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

//

controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 10, 0);
controls.minDistance = 40.0;
controls.maxDistance = 200.0;
controls.update();

//

// stats = new Stats();
// container.appendChild( stats.dom );

// GUI

const gui = new dat.GUI();

const folderSky = gui.addFolder('Sky');
folderSky.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
folderSky.add(parameters, 'azimuth', -180, 180, 0.1).onChange(updateSun);
folderSky.open();



//

window.addEventListener('resize', onWindowResize);


function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);
	render();
	// stats.update();

}

function render() {

	const time = performance.now() * 0.001;

	// mesh.position.y = Math.sin( time ) * 20 + 5;
	// mesh.rotation.x = time * 0.5;
	// mesh.rotation.z = time * 0.51;


	renderer.render(scene, camera);

}
animate()