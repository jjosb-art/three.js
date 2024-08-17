import {
	AnimationMixer, LoopOnce
} from 'three';//애니메이션 제어, 업데이트

export class House {
	constructor(info) {
		this.x = info.x;
		this.y = info.y;
		this.z = info.z;
		this.actions = [];//배열 초기화

		this.animationClip = [];
		// this.visible = false;

		info.gltfLoader.load(
			info.modelSrc,
			glb => {
				console.log(glb);
				glb.scene.traverse(child => {//모든 다식 객체 순회
					if (child.isMesh) {
						child.castShadow = true;
						child.material = info.elepondMaterial; // elepondMaterial 적용
					}
					// console.log('First GLB node:', child.name); // 모든 노드 이름 출력
				});
				// mixer = new THREE.AnimationMixer(this.modelMesh);
				// animationClip = mixer.clipAction(gltf.animations[0]);
				this.modelMesh = glb.scene.children[0];
				this.modelMesh.castShadow = true;
				this.modelMesh.position.set(this.x, this.y, this.z);
				this.modelMesh.scale.set(0.008, 0.008, 0.008);
				info.scene.add(this.modelMesh);
				this.mixer = new AnimationMixer(this.modelMesh);//this.mixer에 새로운 AnimationMixer생성하여 할당
				this.actions[0] = this.mixer.clipAction(glb.animations[0]);
			}
		);

		
		
	}
}
