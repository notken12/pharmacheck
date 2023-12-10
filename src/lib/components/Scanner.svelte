<script lang="ts">
	import * as Tesseract from 'tesseract.js';

	import Camera from './Camera.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { userData } from '$lib/stores';
	import { saveUserData, type Ingredient, type MedicineInfo } from '$lib';

	let scanImage = () => {
		camera.takePicture();
		recognizeText();
	};

	let camera: Camera;
	let medicineInfoResponse: { name: string; ingredients: string[] };

	let recognizeText = async () => {
		const src = camera.getImageData();
		let worker = await Tesseract.createWorker();
		const img = camera.getCanvas().toDataURL('image/png');
		camera.reset();

		let result = await worker.recognize(
			img,
			{},
			{ imageColor: true, imageGrey: true, imageBinary: true }
		);
		resultText = result.data.text;

		const serverResponse = await fetch(
			'/medicine-info?' + new URLSearchParams({ text: result.data.text })
		);
		medicineInfoResponse = await serverResponse.json();
		medicineInfoDialogOpen = true;
		const ingredients: Ingredient[] = [];

		for (const ingredient of medicineInfoResponse.ingredients) {
			const response = await fetch(
				'https://rxnav.nlm.nih.gov/REST/rxcui.xml?' +
					new URLSearchParams({ name: ingredient, search: '2', format: '.json' })
			);
			const data = await response.json();

			ingredients.push({
				name: ingredient,
				rxNormId: data.idGroup.rxnormId[0]
			});
		}

		const medicineInfo: MedicineInfo = {
			name: medicineInfoResponse.name,
			ingredients: ingredients
		};

		console.log(medicineInfo);

		$userData.scanHistory.push({
			timestamp: new Date().getTime(),
			medicineInfo: medicineInfo
		});
		userData.set($userData);
		saveUserData($userData);

		const ingredientIds = getPastIngredientIds();
		console.log(ingredientIds);

		ingredientIds.join(' ');
		const interaction = await fetch(
			'https://rxnav.nlm.nih.gov/REST/interaction/list.xml?' + 
				new URLSearchParams({format : '.json', rxcuis : ingredientIds})
		);
		const resObject = await interaction.json();

		for(const interationTypeGroup of resObject.fullInteractionTypeGroup) {
			for(const interactionType of interactionTypeGroup.full)
		}
	};

	let getPastIngredientIds = () => {
		const ingredientIds: string[] = [];
		for (const record of $userData.scanHistory) {
			for (const ingredient of record.medicineInfo.ingredients) {
				ingredientIds.push(ingredient.rxNormId);
			}
		}
		return ingredientIds;
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
					Name: {medicineInfoResponse?.name || 'None'}
				</p>
				<p>
					Active ingredients: {medicineInfoResponse?.ingredients || 'None'}
				</p>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
