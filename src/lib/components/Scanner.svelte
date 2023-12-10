<script lang="ts">
	import * as Tesseract from 'tesseract.js';

	import Camera from './Camera.svelte';
	import { Button } from '$lib/components/ui/button';

	let scanImage = () => {
		camera.takePicture();
		recognizeText();
	};

	let camera: Camera;

	let recognizeText = async () => {
		const src = camera.getImageData();
		let worker = await Tesseract.createWorker();
		const img = camera.getCanvas().toDataURL('image/png');
		let result = await worker.recognize(
			img,
			{},
			{ imageColor: true, imageGrey: true, imageBinary: true }
		);
		resultText = result.data.text;

		const serverResponse = await fetch(
			'/medicine-info?' + new URLSearchParams({ text: result.data.text })
		);
		const medicineInfo = await serverResponse.json();
		console.log(medicineInfo);
	};

	let resultText = '';
</script>

<Camera bind:this={camera}></Camera>
<Button on:click={scanImage}>Scan</Button>
<p>{resultText}</p>
