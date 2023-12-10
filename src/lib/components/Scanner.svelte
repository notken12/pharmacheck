<script lang="ts">
	import * as Tesseract from 'tesseract.js';

	import Camera from './Camera.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { userData } from '$lib/stores';
	import { saveUserData, type Ingredient, type MedicineInfo } from '$lib';
	import * as Accordion from '$lib/components/ui/accordion';

	let scanImage = () => {
		camera.takePicture();
		const src = camera.getImageData();
		const img = camera.getCanvas().toDataURL('image/png');
		camera.reset();
		recognizeText(img);
	};

	let scanFileInputImage = () => {
		recognizeText(inputFiles[0]);
	};

	let camera: Camera;
	let medicineInfoResponse: { name: string; ingredients: string[] };

	let recognizeText = async (img: Tesseract.ImageLike) => {
		let worker = await Tesseract.createWorker();
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
	};

	const analyzeCurrentMedicine = async () => {
		interactionsDialogOpen = true;
		const ingredients: Ingredient[] = [];

		for (const ingredient of medicineInfoResponse.ingredients) {
			const response = await fetch(
				'https://rxnav.nlm.nih.gov/REST/rxcui.json?' +
					new URLSearchParams({ name: ingredient, search: '2' })
			);
			const data = await response.json();

			if (!data.idGroup?.rxnormId || !data.idGroup.rxnormId[0]) continue;

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

		const ingredientIds = getPastIngredientIds().join(' ');
		console.log(ingredientIds);

		const interaction = await fetch(
			'https://rxnav.nlm.nih.gov/REST/interaction/list.json?' +
				new URLSearchParams({ rxcuis: ingredientIds })
		);
		const resObject = await interaction.json();
		const interactions: Interaction[] = [];

		if (Array.isArray(resObject.fullInteractionTypeGroup)) {
			for (const interactionGroup of resObject.fullInteractionTypeGroup) {
				for (const interactionType of interactionGroup.fullInteractionType) {
					const { severity, description } = interactionType.interactionPair[0];
					const interaction: Interaction = {
						severity: severity,
						description: description,
						pairs: []
					};
					for (const pair of interactionType.interactionPair) {
						//interactionPair: interactions between different drugs that result in the same effect
						interaction.pairs.push(
							pair.interactionConcept.map(
								(c: { minConceptItem: { name: string; rxcui: string } }) => {
									return {
										name: c.minConceptItem.name,
										rxNormId: c.minConceptItem.rxcui
									};
								}
							)
						);
					}
					interactions.push(interaction);
				}
			}
		}

		console.log(interactions);
		currentInteractions = interactions;
	};

	let currentInteractions: Interaction[] | null = null;

	type Interaction = {
		severity: string;
		description: string;
		pairs: Ingredient[][]; // list of pairs of ingredients
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
	let interactionsDialogOpen = false;

	let inputFiles: FileList;
</script>

<input
	bind:files={inputFiles}
	on:change={scanFileInputImage}
	type="file"
	accept="image/png;capture=camera"
/>

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
			<AlertDialog.Action on:click={analyzeCurrentMedicine}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root open={interactionsDialogOpen}>
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
				{#if currentInteractions != null}
					<h2>Interactions</h2>
					<Accordion.Root class="w-full sm:max-w-[70%]">
						{#each currentInteractions as interaction}
							<Accordion.Item value="item-1">
								<Accordion.Trigger>
									<span>Severity: {interaction.severity}</span>
									<span>{interaction.description}</span>
								</Accordion.Trigger>
								<Accordion.Content>
									{#each interaction.pairs as pair}
										<p>
											<b class="capitalize">{pair[0].name}</b> ⇔
											<b class="capitalize">{pair[1].name}</b>
										</p>
									{/each}
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				{:else}
					<p>Analyzing interactions...</p>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
