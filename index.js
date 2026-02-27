// ===== IMPORT THREE =====
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";


// ===== CANVAS =====
const canvas = document.getElementById("threeCanvas");


// ===== SCENE =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);


// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);


// ===== RENDERER =====
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


// ===== LIGHT =====
const light1 = new THREE.DirectionalLight(0xffffff, 2);
light1.position.set(5, 10, 5);
scene.add(light1);

const light2 = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(light2);


// ===== CONTROLS =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// ===== MODEL LOADER =====
const loader = new GLTFLoader();

// 🔥 CHANGE PATH TO YOUR MODEL
loader.load(
  "models/lab/model.glb",   // example path — change this
  function (gltf) {

    const model = gltf.scene;

    model.scale.set(1, 1, 1);   // resize if needed
    model.position.set(0, 0, 0);

    scene.add(model);
  },

  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + "% loaded");
  },

  function (error) {
    console.error("Model load error:", error);
  }
);


// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


// ===== ANIMATE =====
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
