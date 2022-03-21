import * as THREE from 'three'


const texture = textureLoader.load('https://threejsfundamentals.org/threejs/resources/images/bayer.png');

const uniformsGogh = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3(1, 1, 1) },
    iChannel0:  { type: 't', value: textureLoader.load('/textures/vg/main.jpg') },
    iChannel1:  { type: 't', value: textureLoader.load('/textures/vg/noise.jpg') },
    iChannel2:  { type: 't', value: textureLoader.load('/textures/vg/pubbles.jpg') },
    iChannelResolution: new THREE.Vector3(1, 1, 1),
    'iChannelResolution[4]': { value: '('+sizes.width+','+ sizes.height+')' },
    // iGlobalTime: { value: 1.0 },
    // iChannelTime: { value: 1.0 },
    // iDate: { value: new THREE.Vector4(1, 1, 1, 1)},
    // iSampleRate: { value: 1.0 },
    // iFrame: { value: 1 },
    // iTimeDelta: { value: 1.0 },
    // iFrameRate: { value: 1.0 }
};

const uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3(1, 1, 1) },
    iChannel0: { value: texture },
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;

const material = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms:uniforms,
    vertexShader
});

const materialVan = new THREE.MeshStandardMaterial({
    map: textureLoader.load('/textures/vg/1bf51a7977264a49bfb557644dfa0b90.jpeg'),
    transparent: false,
    displacementScale: 0,
})
