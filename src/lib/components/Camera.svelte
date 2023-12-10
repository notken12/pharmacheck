<script lang="ts">
	import { onMount } from 'svelte';

	let facingMode: string = 'environment';
	let constraints = {
		audio: false,
		video: {
			facingMode: facingMode,
			width: { min: 1024, ideal: 1280, max: 1920 },
			height: { min: 576, ideal: 720, max: 1080 }
		}
	};

	let videoWidth: number;
	let videoHeight: number;

	let videoEl: HTMLVideoElement;
	let pictureResultEl: HTMLCanvasElement;
	let canvasContext: CanvasRenderingContext2D;

	onMount(async () => {
		let stream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints);
		videoEl.srcObject = stream;
		canvasContext = pictureResultEl.getContext('2d', {
			willReadFrequently: true
		}) as CanvasRenderingContext2D;
	});

	const videoUpdated = (e: Event) => {
		videoWidth = videoEl.videoWidth;
		videoHeight = videoEl.videoHeight;
		videoEl.play();
	};

	let pictureTaken = false;

	export const takePicture = () => {
		if (canvasContext == null) return;
		if (videoWidth && videoHeight) {
			pictureResultEl.width = videoWidth;
			pictureResultEl.height = videoHeight;
			canvasContext.drawImage(videoEl, 0, 0, videoWidth, videoHeight);
			pictureTaken = true;
			console.log('snap');
		}
	};

	export const getImageData = () => {
		return canvasContext.getImageData(0, 0, pictureResultEl.width, pictureResultEl.height);
	};

	export const getCanvasContext = () => {
		return canvasContext;
	};

	export const getCanvas = () => {
		return pictureResultEl;
	};

	export const reset = () => {
		pictureTaken = false;
		canvasContext.clearRect(0, 0, pictureResultEl.width, pictureResultEl.height);
	};
</script>

<div class="videoContainer rounded-lg" style:aspect-ratio={videoWidth / videoHeight}>
	<video
		bind:this={videoEl}
		width={videoWidth}
		height={videoHeight}
		on:loadedmetadata={videoUpdated}
		muted
		playsinline
	></video>

	<canvas bind:this={pictureResultEl} class="hidden" />
</div>

<!-- <p>{videoWidth} x {videoHeight}</p> -->

<style>
	.videoContainer {
		max-height: 400px;
		display: flex;
		overflow: hidden;
	}
</style>
