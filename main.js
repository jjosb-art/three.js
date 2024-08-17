import * as THREE from 'three';
import { GLTFLoader, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player } from './Player';
import { House } from './House';
// import { Ear } from './Ear.js';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Texture
const textureLoader = new THREE.TextureLoader();
const floorTexture = textureLoader.load('/images/ground.jpg');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.x = 10;
floorTexture.repeat.y = 10

// HDRI
// renderer.outputEncoding = THREE.sRGBEncoding;

const rgbeLoader = new RGBELoader();
rgbeLoader.load('/images/belfast_sunset_4k.hdr', function (texture) {
	texture.mapping = THREE.EquirectangularReflectionMapping;
	scene.background = texture;
	scene.environment = texture;
	scene.backgroundIntensity = 0.1; // 배경 밝기 조절
	scene.environmentIntensity = 0.25; // 조명으로 사용되는 환경 맵의 강도 조절

})

// elepondMaterial
const elepondMaterial = new THREE.MeshStandardMaterial({
	color: 0xE6E6E6,
	// map: elepondTexture,
	roughness: 0.4,
	metalness: 0.2,
	flatShading: true
})

// Material
const grassMaterial = new THREE.MeshStandardMaterial({
	color: 0x709C72,
	// map: texture,
	roughness: 0.4,
	flatShading: true
})
const rainMaterial = new THREE.MeshStandardMaterial({
	color: 0xD9D9D9,
	roughness: 0.4,
	transparent: true, // 투명도 조절을 가능하게 설정
	opacity: 0.7,      // 투명도 50%로 설정
	flatShading: true
})

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.setClearColor('#EDBC9B');
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.OrthographicCamera(
	-(window.innerWidth / window.innerHeight), // left
	window.innerWidth / window.innerHeight, // right,
	1, // top
	-1, // bottom
	-1000,
	1000
);

const cameraPosition = new THREE.Vector3(1, 5, 5);
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
camera.zoom = 0.2;
camera.updateProjectionMatrix();
scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight('orange', 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 1.0);
const directionalLightOriginPosition = new THREE.Vector3(1, 1, 1);
directionalLight.position.x = directionalLightOriginPosition.x;
directionalLight.position.y = directionalLightOriginPosition.y;
directionalLight.position.z = directionalLightOriginPosition.z;
directionalLight.castShadow = true;

// mapSize 세팅으로 그림자 퀄리티 설정
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
// 그림자 범위
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
directionalLight.shadow.camera.near = -100;
directionalLight.shadow.camera.far = 100;
scene.add(directionalLight);

// Mesh
// const grid = new THREE.GridHelper(40, 40);
// scene.add(grid);
const meshes = [];
const floorMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	new THREE.MeshStandardMaterial({
		map: floorTexture,
		// opacity: 0.45,
		// transparent: true // 투명도를 적용하려면 transparent를 true로 설정
	})
);
floorMesh.name = 'floor';
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;
scene.add(floorMesh);
meshes.push(floorMesh);

const pointerMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(0, 0),
	new THREE.MeshBasicMaterial({
		// color: 'crimson',
		// transparent: true,
		// opacity: 0
	})
);
pointerMesh.rotation.x = -Math.PI / 2;
pointerMesh.position.y = 0.01;
pointerMesh.receiveShadow = true;
scene.add(pointerMesh);

const spotMesh = new THREE.Mesh(
	new THREE.CircleGeometry(1, 16),
	new THREE.MeshStandardMaterial({
		color: 'skyblue',
		roughness: 0.1,
		transparent: true,
		opacity: 0.6
	})
);
spotMesh.position.set(5, 0.005, 5);
spotMesh.rotation.x = -Math.PI / 2;
spotMesh.receiveShadow = true;
scene.add(spotMesh);

// 1. 랜덤 `SpotMesh` 생성 함수
function createRandomSpotMesh() {
	const geometry = new THREE.CircleGeometry(1, 16); // 작은 구형 메쉬
	const material = new THREE.MeshBasicMaterial({
		// color: Math.random() * 0xffffff 
		color: 'skyblue',
		roughness: 0.1,
		transparent: true,
		opacity: 0.6
	});
	const spotMesh2 = new THREE.Mesh(geometry, material);

	// 랜덤 위치 설정
	spotMesh2.position.set(
		(Math.random() - 0.5) * 20, // x: -10 to 10
		0.01,
		(Math.random() - 0.5) * 20  // z: -10 to 10
	);
	spotMesh2.rotation.x = -Math.PI / 2;
	spotMesh2.receiveShadow = true;

	return spotMesh2;
}
// 애니메이션 재생 함수
// function playChargeAnimation() {
//     if (chargeAction) {
//         chargeAction.play();
//     }
// }

// 3. 충돌 감지 및 애니메이션 재생
function checkCollision() {
    player.modelMesh.traverse(child => {
        if (child.isMesh) {
            spotMeshes.forEach(spotMesh2 => {
                const distance = child.position.distanceTo(spotMesh2.position);
                if (distance < 1) { // 거리 기준으로 충돌 감지
                    // playChargeAnimation();
					chargeAction.play();
                }
            });
        }
    });
}

const spotMeshes = [];

// 6. 랜덤 `SpotMesh`를 주기적으로 생성
function spawnSpotMeshes() {
	for (let i = 0; i < 5; i++) { // 5개의 랜덤 `SpotMesh`를 생성
		const spotMesh2 = createRandomSpotMesh();
		scene.add(spotMesh2);
		spotMeshes.push(spotMesh2);
	}
}
// GLTF
const gltfLoader = new GLTFLoader();
let mixer;

const house = new House({
	gltfLoader,
	scene,
	modelSrc: '/models/lowpoly_ear.glb',
	elepondMaterial: elepondMaterial,
	x: 5,
	y: -4.3,
	z: 2
});

const player = new Player({
	scene,//three.js장면
	meshes,//모델을 추가할 배열
	gltfLoader,
	modelSrc1: '/models/tex_move.glb',        // 첫 번째 파일 (모델 포함)
	// modelSrc2: '/models/Ear.glb', // 두 번째 파일 (애니메이션만 포함)
	elepondMaterial: elepondMaterial // elepondMaterial 추가


});

let chargeMesh;
let chargeAction;

const loader1 = new GLTFLoader();
loader1.load(
	'./models/tex_charge.glb',
	gltf => {
		console.log("charge", gltf.animations);
		chargeMesh = gltf.scene;
		// chargeMesh.scale.set(0.005, 0.005, 0.005);
		chargeMesh.scale.set(0, 0, 0);
		scene.add(chargeMesh);

		// 모든 Mesh에 elepondMaterial 적용
		chargeMesh.traverse(child => {

		});

		// 특정 메쉬에 대해 AnimationMixer 생성
		mixer = new THREE.AnimationMixer(chargeMesh);

		// 애니메이션 클립을 액션으로 변환
		if (gltf.animations && gltf.animations.length > 0) {
			const chargeClip = gltf.animations[0];
			chargeAction = mixer.clipAction(chargeClip);
			// chargeAction.play();
		} else {
			console.warn('No animations found in the GLB file.');
		}
	}
)

let hoseMesh;
let hoseAction;
let mixer_hose;

const loader2 = new GLTFLoader();
loader2.load(
	'./models/hose1.glb',
	gltf => {
		console.log("hose", gltf.animations);
		hoseMesh = gltf.scene;
		hoseMesh.castShadow = true;
		hoseMesh.receiveShadow = true;
		// chargeMesh.scale.set(0.005, 0.005, 0.005);
		hoseMesh.scale.set(0, 0, 0);

		scene.add(hoseMesh);
		// hoseMesh.traverse(child => {
		// 	if (child.isMesh) {
		// 		child.position.set(0,-3,0);

		// 	}
		// });

		// 특정 메쉬에 대해 AnimationMixer 생성
		mixer_hose = new THREE.AnimationMixer(hoseMesh);

		// 애니메이션 클립을 액션으로 변환
		if (gltf.animations && gltf.animations.length > 0) {
			const hoseClip = gltf.animations[0];
			hoseAction = mixer_hose.clipAction(hoseClip);
			// hoseAction.play();

		} else {
			console.warn('No animations found in the GLB file.');
		}
		// 애니메이션 작동 확인 코드
		// function animate() {
		// 	requestAnimationFrame(animate);
		// 	// Update animation mixers
		// 	if (mixer) mixer.update(0.01);
		// 	if (mixer_hose) mixer_hose.update(0.01);
		// 	renderer.render(scene, camera);
		// }
		// animate();

	}
)

let legMesh
const loader5 = new GLTFLoader();
loader5.load(
	'./models/hose2.glb',
	gltf => {

		legMesh = gltf.scene;
		legMesh.castShadow = true;
		legMesh.receiveShadow = true;
		// chargeMesh.scale.set(0.005, 0.005, 0.005);
		legMesh.scale.set(0, 0, 0);

		scene.add(legMesh);
	}
)

let grassMesh;
// let grassAction;
// let mixer_grass;

const loader3 = new GLTFLoader();
loader3.load(
	'./models/lowpoly_grass.glb',
	gltf => {
		console.log("grass", gltf.animations);
		grassMesh = gltf.scene;
		grassMesh.scale.set(1.3, 1.3, 1.3);
		grassMesh.castShadow = true;
		grassMesh.receiveShadow = true;

		grassMesh.scale.set(0.008, 0.008, 0.008);
		grassMesh.position.set(0, -2, 0);
		scene.add(grassMesh);
		// grassMesh.position.set(0,0,0);
		grassMesh.traverse(child => {
			if (child.isMesh) {
				child.material = grassMaterial;

			}
		});
	}
)

let rainMesh;
let rainAction;
let mixer_rain;

const loader4 = new GLTFLoader();
loader4.load(
	'./models/rain_2.glb',
	gltf => {
		console.log("rain", gltf.animations);
		rainMesh = gltf.scene;
		// rainMesh.scale.set(1.3,1.3,1.3);
		rainMesh.castShadow = true;
		rainMesh.receiveShadow = true;

		rainMesh.scale.set(0.006, 0.006, 0.006);
		rainMesh.position.set(0, 0.2, -0.6);
		scene.add(rainMesh);

		rainMesh.traverse(child => {
			if (child.isMesh) {
				child.material = rainMaterial;
			}
		});

		//특정 메쉬에 대해 AnimationMixer 생성
		mixer_rain = new THREE.AnimationMixer(rainMesh);

		// 애니메이션 클립을 액션으로 변환
		if (gltf.animations && gltf.animations.length > 0) {
			const rainClip = gltf.animations[0];
			rainAction = mixer_rain.clipAction(rainClip);
			rainAction.play();

		} else {
			console.warn('No animations found in the GLB file.');
		}
	}
)


const rainSpotMesh = new THREE.Mesh(
	new THREE.CircleGeometry(1, 16),
	new THREE.MeshStandardMaterial({
		color: 'white',
		roughness: 0.1,
		transparent: true,
		opacity: 0.6
	})
);
rainSpotMesh.position.set(-2, 0.005, 5);
rainSpotMesh.rotation.x = -Math.PI / 2;
rainSpotMesh.receiveShadow = true;
scene.add(rainSpotMesh);




// const ear = new Ear({
// 	scene,
// 	meshes,
// 	gltfLoader,

//     animationSrc: '/models/lowpoly_ear.glb', // 두 번째 파일 (애니메이션만 포함)
// 	elepondMaterial: elepondMaterial
// });


const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let destinationPoint = new THREE.Vector3();
let angle = 0;
let isPressed = false; // 마우스를 누르고 있는 상태
let animationClip;
let isInSpecificZone = false; // 플래그 추가

function onDocumentMouseMove(event) {
    if (isInSpecificZone) return; // 특정 구역에 있으면 레이캐스팅을 멈춤

    // 레이캐스팅 로직
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        // 플레이어가 특정 오브젝트와 상호작용하는 로직
    }
}

document.addEventListener('mousemove', onDocumentMouseMove, false);


// 그리기
const clock = new THREE.Clock();

function draw() {
	const delta = clock.getDelta();

	if (player.mixer) player.mixer.update(delta);

	if (player.modelMesh) {
		camera.lookAt(player.modelMesh.position);
	}

	if (player.modelMesh) {

		if (isPressed) {
			raycasting();
		}

		if (player.moving) {
			// 걸어가는 상태
			angle = Math.atan2(
				destinationPoint.z - player.modelMesh.position.z,
				destinationPoint.x - player.modelMesh.position.x
			);
			player.modelMesh.position.x += Math.cos(angle) * 0.05;
			player.modelMesh.position.z += Math.sin(angle) * 0.05;

			camera.position.x = cameraPosition.x + player.modelMesh.position.x;
			camera.position.z = cameraPosition.z + player.modelMesh.position.z;

			// player.actions[0].play();
			player.playWalk();
			// player.actions[1].play();

			if (
				Math.abs(destinationPoint.x - player.modelMesh.position.x) < 0.03 &&
				Math.abs(destinationPoint.z - player.modelMesh.position.z) < 0.03
			) {
				player.moving = false;
				console.log('멈춤');
			}

			if (
				Math.abs(spotMesh.position.x - player.modelMesh.position.x) < 1.5 &&
				Math.abs(spotMesh.position.z - player.modelMesh.position.z) < 1.5
			) {
				if (!house.visible) {
					console.log('들어가');
					house.visible = true;
					spotMesh.material.color.set('skyblue');
					gsap.to(
						player.modelMesh.scale,
						{
							x: 0,
							y: 0,
							z: 0,
							duration: 0.02, // 애니메이션 지속 시간
							ease: 'power2.inOut' // 애니메이션의 이징 함수
						}
					);
					gsap.to(
						camera.position,
						{
							duration: 2,
							y: 3
						}
					);
					gsap.to(
						chargeMesh.scale,
						{
							x: 0.005,
							y: 0.005,
							z: 0.005,
							duration: 0.02, // 애니메이션 지속 시간
							ease: 'power2.inOut' // 애니메이션의 이징 함수
						}
					);
					chargeAction.play();

				}
			} else if (house.visible) {
				console.log('나와');
				house.visible = false;
				spotMesh.material.color.set('skyblue');
				gsap.to(
					chargeMesh.scale,
					{
						x: 0,
						y: 0,
						z: 0,
						duration: 0.02, // 애니메이션 지속 시간
						ease: 'power2.inOut' // 애니메이션의 이징 함수
					}
				);
				chargeAction.stop();
				chargeAction.reset();
				gsap.to(
					player.modelMesh.scale,
					{
						x: 0.005,
						y: 0.005,
						z: 0.005, // 애니메이션할 투명도 값
						duration: 0.02, // 애니메이션 지속 시간
						ease: 'power2.inOut' // 애니메이션의 이징 함수
					}
				);
				gsap.to(
					camera.position,
					{
						duration: 1,
						y: 5
					}
				);
			}
		} else {
			// 서 있는 상태
			player.actions[0].stop();
			// player.actions[1].play();
			// player.actions[0].paused = ture;
			// player.actions[0].reset();
			// player.actions[0].play();
		}
		// chargeMesh의 위치와 회전값을 player.modelMesh와 동일하게 설정
		if (chargeMesh) {
			chargeMesh.position.copy(player.modelMesh.position);
			chargeMesh.quaternion.copy(player.modelMesh.quaternion);
		}
		if (hoseMesh) {
			hoseMesh.position.copy(player.modelMesh.position);
			hoseMesh.quaternion.copy(player.modelMesh.quaternion);
		}
		if (legMesh) {
			legMesh.position.copy(player.modelMesh.position);
			legMesh.quaternion.copy(player.modelMesh.quaternion);
		}
	}

	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}

function checkIntersects() {
	// raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(meshes);
	for (const item of intersects) {
		if (item.object.name === 'floor') {
			destinationPoint.x = item.point.x;
			destinationPoint.y = 0.3;
			destinationPoint.z = item.point.z;
			player.modelMesh.lookAt(destinationPoint);

			// console.log(item.point)

			player.moving = true;

			pointerMesh.position.x = destinationPoint.x;
			pointerMesh.position.z = destinationPoint.z;
		}
		break;
	}
}

function setSize() {
	camera.left = -(window.innerWidth / window.innerHeight);
	camera.right = window.innerWidth / window.innerHeight;
	camera.top = 1;
	camera.bottom = -1;

	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
}

// 이벤트
window.addEventListener('resize', setSize);

// 마우스 좌표를 three.js에 맞게 변환
function calculateMousePosition(e) {
	mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
}

// 변환된 마우스 좌표를 이용해 래이캐스팅
function raycasting() {
	raycaster.setFromCamera(mouse, camera);
	checkIntersects();
}

// 마우스 이벤트
canvas.addEventListener('mousedown', e => {
	isPressed = true;
	calculateMousePosition(e);

});
canvas.addEventListener('mouseup', () => {
	isPressed = false;
});
canvas.addEventListener('mousemove', e => {
	if (isPressed) {
		calculateMousePosition(e);
	}
});

// 터치 이벤트
canvas.addEventListener('touchstart', e => {
	isPressed = true;
	calculateMousePosition(e.touches[0]);
});
canvas.addEventListener('touchend', () => {
	isPressed = false;
});
canvas.addEventListener('touchmove', e => {
	if (isPressed) {
		calculateMousePosition(e.touches[0]);
	}
});

// 마우스 클릭 이벤트 설정
document.addEventListener('click', onDocumentClick);
// 마우스 클릭 이벤트 핸들러
function onDocumentClick(event) {
	// 마우스 좌표를 정규화된 장치 좌표(-1 ~ +1)로 변환
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	console.log(mouse.x, mouse.y);

	// Raycaster를 사용하여 클릭된 객체를 감지
	raycaster.setFromCamera(mouse, camera);
	// const intersects = raycaster.intersectObjects(scene.children, true);
	// Raycaster를 통해 충돌 감지
	const intersects = raycaster.intersectObject(player.modelMesh);

	if (intersects.length > 0) {
		gsap.to(
			player.modelMesh.scale,
			{
				x: 0,
				y: 0,
				z: 0, // 애니메이션할 투명도 값
				duration: 0.005, // 애니메이션 지속 시간
				ease: 'power2.inOut' // 애니메이션의 이징 함수
			}
		);
		gsap.to(
			hoseMesh.scale,
			{
				x: 0.005,
				y: 0.005,
				z: 0.005,
				duration: 0.005
			}
		)
		gsap.to(
			legMesh.scale,
			{
				x: 0.005,
				y: 0.005,
				z: 0.005,
				duration: 0.005
			}
		)

		gsap.to(
			camera.position,
			{
				duration: 1,
				y: 3
			}
		);


		hoseAction.play(); // 클릭 시 애니메이션 재생
		gsap.fromTo(grassMesh.position,
			{ x: hoseMesh.position.x, y: hoseMesh.position.y - 2, z: hoseMesh.position.z },
			{ x: hoseMesh.position.x, y: hoseMesh.position.y, z: hoseMesh.position.z, duration: 2, ease: 'power2.out' }
		);
		console.log("HOSE!!");

	} else {

		gsap.to(
			player.modelMesh.scale,
			{
				x: 0.005,
				y: 0.005,
				z: 0.005, // 애니메이션할 투명도 값
				duration: 0.005, // 애니메이션 지속 시간
				ease: 'power2.inOut' // 애니메이션의 이징 함수
			}
		);
		gsap.to(
			hoseMesh.scale,
			{
				x: 0,
				y: 0,
				z: 0,
				duration: 0.005
			}
		)
		gsap.to(
			legMesh.scale,
			{
				x: 0,
				y: 0,
				z: 0,
				duration: 0.005
			}
		)
		gsap.to(
			camera.position,
			{
				duration: 1,
				y: 5
			}
		);
		//grassMesh를 다시 숨김
		gsap.to(grassMesh.position, {
			y: hoseMesh.position.y - 2,
			duration: 1,
			ease: 'power2.inOut'
		});
		hoseAction.stop();

	}
}

let speed = 0.01; // 이동 속도
// 애니메이션 루프 업데이트
function animate() {
	requestAnimationFrame(animate);
	const deltaTime = clock.getDelta();
	
	if (player) player.update(deltaTime);
	if (mixer) mixer.update(deltaTime);
	if (mixer_hose) mixer_hose.update(deltaTime);
	if (mixer_rain) mixer_rain.update(deltaTime);

	// checkCollision();

	// rainMesh의 위치 업데이트
	if (rainMesh) {
		rainMesh.position.x += speed; // X축으로 이동
		rainMesh.position.x += Math.sin(Date.now() * 0.001) * 0.01; // Y축으로 부드럽게 상하 이동
		rainMesh.position.z += speed; // Z축으로 이동

		// 조건에 따라 방향을 반전시켜 모델을 반복해서 움직이게 할 수 있음
		if (rainMesh.position.x > 10 || rainMesh.position.x < -10) {
			speed = -speed;
		}
	}
	renderer.render(scene, camera);

}


// 스페이스 바 이벤트 리스너 설정
window.addEventListener('keydown', (event) => {
	if (event.code === 'Space') {
		console.log('space');
		player.playSecondAnimation();
	}
});

animate();
spawnSpotMeshes();

// // 스페이스 바를 눌렀을 때 두 번째 애니메이션 재생
// window.addEventListener('keydown', (event) => {
// 	if (event.code === 'Space') {
// 		player.playAnimation(1); // 두 번째 애니메이션 재생
// 	}
// });

// // 특정 키를 눌렀을 때 첫 번째 애니메이션 재생
// window.addEventListener('keydown', (event) => {
// 	if (event.code === 'KeyA') { // 원하는 키 코드로 변경
// 		player.playAnimation(0); // 첫 번째 애니메이션 재생
// 	}
// });
// 5초 후에 두 번째 애니메이션 재생
// setTimeout(() => {
// 	player.playSecondAnimation();
// }, 5000);


draw();