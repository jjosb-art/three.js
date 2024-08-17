
import {
	AnimationMixer, LoopOnce
} from 'three';//애니메이션 제어, 업데이트



export class Player {
	constructor(info) {
		// this.moxer = null;
		this.moving = false;//초기화
		this.secondAnimations = []; // 두 번째 애니메이션을 저장할 배열
		this.actions = [];//배열 초기화
		this.meshes = [];

		// const textureLoader = new THREE.TextureLoader();
		// const textures = {
		// body: textureLoader.load('/images/body.png')
		// }

		// 첫 번째 glb
		info.gltfLoader.load(
			info.modelSrc1, //모델로드
			
			glb => {
				console.log(glb);
				glb.animations.forEach(clip => {
					clip.name = 'move'; // 애니메이션 클립 이름 변경
				});
				glb.scene.traverse(child => {//모든 다식 객체 순회
					if (child.isMesh) {		
			
						child.castShadow = true;
						// 투명도 설정
                        child.material.transparent = true;
                        child.material.opacity = 1; // 초기 투명도 값

						// // 복제된 재질을 메쉬에 적용
                        // child.material = clonedMaterial;
					}
					// child.material.needsUpdate = true;  // 매테리얼 업데이트 필요
					// console.log('First GLB node:', child.name); // 모든 노드 이름 출력
				});



				//모델 설정
				this.modelMesh = glb.scene;
				this.modelMesh.position.y = 0.3;
				this.modelMesh.scale.set(0.005, 0.005, 0.005);

				this.modelMesh.name = 'ilbuni';
				info.scene.add(this.modelMesh);
				info.meshes.push(this.modelMesh);

				//애니메이션 설정
				// this.actions = [];//베열 초기화
				this.mixer = new AnimationMixer(this.modelMesh);//this.mixer에 새로운 AnimationMixer생성하여 할당
				this.actions[0] = this.mixer.clipAction(glb.animations[0]);
				// this.action[0].clampWhenFinished = true; // 애니메이션이 끝나면 정지

				// this.actions[1] = this.mixer.clipAction(glb.animations[1]);
				
				this.meshes[0] = this.modelMesh;

				// // 두 번째 GLB 로드
				// this.loadSecondGLB(info);
			});
	}

	loadSecondGLB(info) {
		// 두 번째 glb
		info.gltfLoader.load(
			info.modelSrc2, //애니메이션 파일 로드
			glb2 => {
				console.log(glb2.animations);
				console.log('Second GLB loaded:', glb2);
				glb2.animations.forEach(clip => {
					clip.name = 'ear'; // 애니메이션 클립 이름 변경
				});
				
				glb2.scene.traverse(child => {
                    if (child.isMesh) {
                        // 재질 복제
                        const clonedMaterial = child.material.clone();

                        // 투명도 설정
                        clonedMaterial.transparent = true;
                        clonedMaterial.opacity = 0; // 원하는 투명도 값

                        // 복제된 재질을 메쉬에 적용
                        child.material = clonedMaterial;
                    }
                });

				const animations = glb2.animations;
				if (animations.length === 0) {
					console.warn('No animations found in second GLB');
					return;
				}
				

				//모델 설정
				this.secondModelMesh = glb2.scene;
				this.secondModelMesh.position.y = 0.3;
				// this.modelMesh.rotation.z = Math.PI /2;
				this.secondModelMesh.scale.set(0.003, 0.003, 0.003);

				this.secondModelMesh.name = 'earGlb';
				info.scene.add(this.secondModelMesh);
				info.meshes.push(this.secondModelMesh);

				//애니메이션 설정
				// this.actions = [];//베열 초기화
				this.mixer = new AnimationMixer(this.secondModelMesh);//this.mixer에 새로운 AnimationMixer생성하여 할당
				this.actions[0] = this.mixer.clipAction(glb.animations[0]);

				// this.actions[1] = this.mixer.clipAction(animations[0]); // 두 번째 애니메이션 배열에 저장
				this.secondAnimations[0] = this.mixer.clipAction(glb2.animations[0]);
				// 애니메이션을 한 번만 재생하도록 설정
				this.secondAnimations[0].loop = LoopOnce;
				// this.secondAnimations[0].clampWhenFinished = true; // 애니메이션이 끝나면 정지

				this.meshes[1] = this.secondModelMesh;
				console.log('Second animations:', animations);
			});
	}


	playWalk() {
		// this.secondAnimations[0].stop(); 
		this.actions[0].play();
		
	}

	playSecondAnimation() {
		// this.actions[0].stop();
		// console.log('First animation stopped');
		// this.secondAnimations[0].play(); // 해당 애니메이션 재생
		// console.log('Second animation started');

		//   // 애니메이션 상태 확인
		//   console.log('First animation status:', this.actions[0].isRunning());
		//   console.log('Second animation status:', this.secondAnimations[0].isRunning());
		  // 첫 번째 GLB의 투명도를 0으로 설정
		  this.meshes[0].traverse(child => {
            if (child.isMesh) {
                child.material.opacity = 0.0;
            }
        });

		this.actions[0].stop();
		// this.secondAnimations[0].play();
		// this.glb2.secondAnimations[0].play();

        // 두 번째 GLB의 투명도를 1로 설정
        if (this.meshes[1]) {
            this.meshes[1].traverse(child => {
                if (child.isMesh) {
                    child.material.opacity = 1.0;
					
                }
            });
		}
	}
	
	update(deltaTime) {
		if (this.mixer) this.mixer.update(deltaTime);
	}


}
