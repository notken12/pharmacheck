<script lang="ts">
	import * as Tesseract from 'tesseract.js';

	import Camera from './Camera.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	let scanImage = () => {
		camera.takePicture();
		recognizeText();
	};

	let camera: Camera;
	let medicineInfo: { name: string; ingredients: string[] };

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
		medicineInfo = await serverResponse.json();
		medicineInfoDialogOpen = true;
	};

	let resultText = '';

	let alertTrigger: Button;
	let trigger: string;

	let medicineInfoDialogOpen = false;
</script>

<Camera bind:this={camera}></Camera>
<Button on:click={scanImage}>Scan</Button>
<p>{resultText}</p>
<p></p>

<AlertDialog.Root open={medicineInfoDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Medicine Info</AlertDialog.Title>
			<AlertDialog.Description>
				<p>
					Name: {medicineInfo?.name || 'None'}
				</p>
				<p>
					Active ingredients: {medicineInfo?.ingredients || 'None'}
				</p>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
