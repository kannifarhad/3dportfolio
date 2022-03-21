import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'

import * as dat from 'dat.gui'
import CANNON from 'cannon';
import fragmentShader from './shaders/liquid';
import { Sky } from './shaders/Sky';
import { Water } from './shaders/Water';

const gltfLoader = new GLTFLoader();
const fbxLoader = new FBXLoader()

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
// const world = new CANNON.World();
// world.broadphase = new CANNON.SAPBroadphase(world)
// world.gravity.set(0, -9.82, 0);
// world.allowSleep = true
scene.background = new THREE.Color( 0x32a895 );
const gui = new dat.GUI()
const debugObject = {}


/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 4, 4)

scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set( 5, 5, 5 );
controls.minDistance = 1.0;
controls.maxDistance = 20.0;
controls.update();
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})


// renderer.gammaFactor = 2.2;
// renderer.gammaOutput = true;
renderer.physicallyCorrectLights = true
// renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 2
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#262837')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Update all materials
 */
 const updateAllMaterials = () =>
 {
     scene.traverse((child) =>
     {
         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
         {
             // child.material.envMap = environmentMap
             child.material.envMapIntensity = debugObject.envMapIntensity
             child.material.needsUpdate = true
             child.castShadow = true
             child.receiveShadow = true
         }
     })
 }



/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight()
ambientLight.color = new THREE.Color(0xffffff)
ambientLight.intensity = 0.5
scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.normalBias = 0.05
// directionalLight.position.set(0.25, 3, - 2.25)
// scene.add(directionalLight)

// gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
// gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
// gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
// gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')









/**
 * CREATING SKY
*/

let sky, sun, water;
sun = new THREE.Vector3();
sky = new Sky();
sky.scale.setScalar( 10000 );
scene.add( sky );

const pmremGenerator = new THREE.PMREMGenerator( renderer );


// Water

const waterGeometry = new THREE.PlaneGeometry( 200, 200 );

water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: textureLoader.load( 'textures/waternormals.jpg', function ( texture ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 0.4,
        fog: scene.fog !== undefined
    }
);
// water = new THREE.Mesh( waterGeometry, new THREE.MeshStandardMaterial( { roughness: 0, metalness:0.8 } ));

water.rotation.x = - Math.PI / 2;
// scene.add( water )

const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure
};

function guiChanged() {
    const uniforms = sky.material.uniforms;
    uniforms[ 'turbidity' ].value = effectController.turbidity;
    uniforms[ 'rayleigh' ].value = effectController.rayleigh;
    uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
    uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
    const theta = THREE.MathUtils.degToRad( effectController.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    uniforms[ 'sunPosition' ].value.copy( sun );
    scene.environment = pmremGenerator.fromScene( sky ).texture;
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    renderer.toneMappingExposure = effectController.exposure;
    renderer.render( scene, camera );

}
const folderSky = gui.addFolder( 'Sky Box' );

folderSky.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
folderSky.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
folderSky.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
folderSky.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
folderSky.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
folderSky.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
folderSky.add( effectController, 'exposure', 0, 3, 0.01 ).onChange( guiChanged );
guiChanged();

const waterUniforms = water.material.uniforms;

const folderWater = gui.addFolder( 'Water' );
folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
folderWater.add( waterUniforms.size, 'value', 2.8, 10, 0.1 ).name( 'size' );
folderWater.open();

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0;
let mixer = null




/** BOX TEST */

// const geometry = new THREE.BoxGeometry( 3, 3, 3 );
// const material = new THREE.MeshStandardMaterial( { roughness: 0, metalness:0.8 } );

// const mesh = new THREE.Mesh( geometry, material );
// scene.add( mesh );


/**
 *  ROBOT ADD
 */

let animations = {
    robot: null,
    brooklyn: null,
    wave:null
};
 fbxLoader.load(
     'models/mat/animations/Waving.fbx',
     (object) => {
        animations.wave = object.animations[0];
     },
     (xhr) => {
         console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
     },
     (error) => {
         console.log(error)
     }
 )

 fbxLoader.load(
    'models/mat/animations/BrooklynUprock.fbx',
    (object) => {
       animations.brooklyn = object.animations[0];
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)


 gltfLoader.load(
    '/models/mat/schene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(0.3, 0.3, 0.3)
        gltf.scene.position.y = 0.03
        gltf.scene.position.z = 1.3
        gltf.scene.position.x = -3
        // gltf.scene.rotation.x = -Math.PI * 0.5;
        gui.add(gltf.scene.position, 'y').min(- 5).max(5).step(0.01).name('boyRoom y')
        gui.add(gltf.scene.position, 'x').min(- 5).max(5).step(0.01).name('boyRoom x')
        gui.add(gltf.scene.position, 'z').min(- 3).max(5).step(0.01).name('boyRoom z')
        controls.update();
        mixer = new THREE.AnimationMixer(gltf.scene)
        // mixer.setDuration = 0.01
        console.log(gltf.animations)
        const action = mixer.clipAction(gltf.animations[1])
        action.play()
        // gltf.scene.traverse( child => {
            
            //     if ( child.material ) child.material.metalness = 0;
            
            // } );
            scene.add(gltf.scene)
            camera.lookAt(gltf.scene.position)
        // updateAllMaterials();
    }
)


/**
 * ROOMS START
 */
gltfLoader.load(
    '/models/workRoom/schene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(1, 1, 1)
        gltf.scene.position.y = 0.05
        gltf.scene.position.z = 0
        gltf.scene.position.x = 0
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        // gltf.scene.rotation.y = -Math.PI * 0.5;
        console.log()
        gltf.scene.traverse( function( node ) {
            if ( node.isMesh ) { node.castShadow = true;node.receiveShadow = true; }
        } );
    
        gui.add(gltf.scene.position, 'y').min(- 5).max(5).step(0.01).name('sofaRoom y')
        gui.add(gltf.scene.position, 'x').min(- 5).max(5).step(0.01).name('sofaRoom x')
        gui.add(gltf.scene.position, 'z').min(- 3).max(5).step(0.01).name('sofaRoom z')
        scene.add(gltf.scene)
    }
)


gltfLoader.load(
    '/models/readRoom/schene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(1, 1, 1)
        gltf.scene.position.y = 0.05
        gltf.scene.position.z = 4.05
        gltf.scene.position.x = 4.05
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        // gltf.scene.rotation.y = -Math.PI * 0.5;
        console.log()
        gltf.scene.traverse( function( node ) {
            if ( node.isMesh ) { node.castShadow = true;node.receiveShadow = true; }
        } );
    
        gui.add(gltf.scene.position, 'y').min(- 5).max(5).step(0.01).name('readRoom y')
        gui.add(gltf.scene.position, 'x').min(- 5).max(5).step(0.01).name('readRoom x')
        gui.add(gltf.scene.position, 'z').min(- 3).max(5).step(0.01).name('readRoom z')
        scene.add(gltf.scene)
    }
)


gltfLoader.load(
    '/models/vanGog/schene.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(1, 1, 1)
        gltf.scene.position.y = -3.43
        gltf.scene.position.z = 4
        gltf.scene.position.x = 0.06

        // gltf.scene.position.y = -3.15
        // gltf.scene.position.z = 1.5
        // gltf.scene.position.x = 0

        // gltf.scene.rotation.y = -Math.PI * 1;

        console.log('snitch',gltf);
        gui.add(gltf.scene.position, 'y').min(- 5).max(5).step(0.01).name('vanGog y')
        gui.add(gltf.scene.position, 'x').min(- 5).max(5).step(0.01).name('vanGog x')
        gui.add(gltf.scene.position, 'z').min(- 3).max(5).step(0.01).name('vanGog z')

        scene.add(gltf.scene)
    }
)

// gltfLoader.load(
//     '/models/boyRoom/scene.gltf',
//     (gltf) =>
//     {
//         gltf.scene.scale.set(0.03, 0.03,0.03)
//         // gltf.scene.position.y = -3.1
//         gltf.scene.position.y = 0.1

//         gltf.scene.position.z = 0
//         gltf.scene.position.x = 3
//         // gltf.scene.rotation.y = -Math.PI * 0.5;
//         gui.add(gltf.scene.position, 'y').min(- 5).max(5).step(0.01).name('boyRoom y')
//         gui.add(gltf.scene.position, 'x').min(- 5).max(5).step(0.01).name('boyRoom x')
//         gui.add(gltf.scene.position, 'z').min(- 3).max(5).step(0.01).name('boyRoom z')

//         scene.add(gltf.scene)
//     }
// )


// gltfLoader.load(
//     '/models/restRoom/scene.gltf',
//     (gltf) =>
//     {
//         gltf.scene.scale.set(0.01, 0.01,0.01)
//         gltf.scene.position.y = 0.1
//         gltf.scene.position.z = 3.94
//         gltf.scene.position.x = -2.18
//         // gltf.scene.rotation.y = -Math.PI * 0.5;

//         console.log('snitch',gltf);
//         gui.add(gltf.scene.position, 'y').min(- 5).max(5).step(0.01).name('snitch y')
//         gui.add(gltf.scene.position, 'x').min(- 5).max(5).step(0.01).name('snitch x')
//         gui.add(gltf.scene.position, 'z').min(- 3).max(5).step(0.01).name('snitch z')

//         scene.add(gltf.scene)
//     }
// )









/**
 * RESIZE EVENTS
 */


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * INIT TICK
*/

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime =  elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // world.step(1 / 60, deltaTime, 3);

    // uniformsGogh.iResolution.value.set(canvas.width, canvas.height, 1);
    // uniformsGogh.iTime.value = elapsedTime;
    // uniforms.iTime.value = elapsedTime;

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    water.material.uniforms[ 'time' ].value += 1.0 / 200.0;
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()