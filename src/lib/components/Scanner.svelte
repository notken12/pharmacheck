<script lang="ts">
	import * as Tesseract from 'tesseract.js';

	import Camera from './Camera.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { userData } from '$lib/stores';
	import { saveUserData, type Ingredient, type MedicineInfo } from '$lib';
	import * as Accordion from '$lib/components/ui/accordion';
	import { each } from 'store';
	import * as Card from '$lib/components/ui/card';

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
	let medicineInfoResponse: { name: string; ingredients: string[] } | null;

	let recognizeText = async (img: Tesseract.ImageLike) => {
		medicineInfoDialogOpen = true;

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
		if (!medicineInfoResponse) return;
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
						const ingredientPair: Ingredient[] = pair.interactionConcept.map(
							(c: { minConceptItem: { name: string; rxcui: string } }) => {
								return {
									name: c.minConceptItem.name,
									rxNormId: c.minConceptItem.rxcui
								};
							}
						);
						interaction.pairs.push(ingredientPair);
					}
					interactions.push(interaction);
				}
			}
		}

		console.log(interactions);
		const medicineIngredientIds = medicineInfo.ingredients.map((a) => a.rxNormId);
		// interactions that involve the current medication being scanned
		currentInteractions = interactions.filter((a) => {
			for (const pair of a.pairs) {
				for (const ingredient of pair) {
					if (medicineIngredientIds.includes(ingredient.rxNormId)) {
						return true;
					}
				}
			}
			return false;
		});
		interactionsByMedicine = new Map();
		for (const interaction of currentInteractions) {
			for (const pair of interaction.pairs) {
				for (const ingredient of pair) {
					const medicine = $userData.scanHistory.find((a) =>
						a.medicineInfo.ingredients.find((ing) => ing.rxNormId == ingredient.rxNormId)
					)?.medicineInfo;
					if (!medicine || medicine == medicineInfo) continue;
					let interactions = interactionsByMedicine.get(medicine);
					if (interactions != null) {
						interactions.list.add(interaction);
						if (interaction.severity.toLowerCase() == 'high') interactions.severe = true;
					} else {
						interactionsByMedicine.set(medicine, {
							severe: interaction.severity.toLowerCase() == 'high',
							list: new Set([interaction])
						});
					}
				}
			}
		}
	};

	let currentInteractions: Interaction[] | null = null;
	let interactionsByMedicine: Map<
		MedicineInfo,
		{ severe: boolean; list: Set<Interaction> }
	> | null = null;

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

	$: hasSevereInteraction =
		!interactionsByMedicine || [...interactionsByMedicine].find(([k, v]) => v.severe) != null;

	$: {
		if (!medicineInfoDialogOpen) {
			resultText = '';
			medicineInfoResponse = null;
		}
	}
</script>

<input
	bind:files={inputFiles}
	on:change={scanFileInputImage}
	type="file"
	accept="image/png;capture=camera"
/>

<Camera bind:this={camera}></Camera>
<Button on:click={scanImage}>Scan</Button>
<AlertDialog.Root open={medicineInfoDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Medicine Info</AlertDialog.Title>
			<AlertDialog.Description>
				{#if medicineInfoResponse}
					<p>
						Name: {medicineInfoResponse?.name || 'None'}
					</p>
					<p>
						Active ingredients: {medicineInfoResponse?.ingredients || 'None'}
					</p>
				{:else if resultText.length > 0}
					<p>Analyzing text to find name and ingredients...</p>
				{:else}
					<p>Reading text from image...</p>
				{/if}
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
					Active ingredients: <b>{medicineInfoResponse?.ingredients || 'None'}</b>
				</p>
				{#if interactionsByMedicine != null && currentInteractions != null}
					<h2>Interactions</h2>
					<div class="flex flex-col gap-4">
						{#each [...interactionsByMedicine] as [medicineInfo, interactions]}
							<Card.Root>
								<Card.Header>
									<Card.Title>{medicineInfo.name}</Card.Title>
								</Card.Header>
								<Card.Content>
									<Accordion.Root class="w-full">
										{#each interactions.list as interaction}
											<Accordion.Item value={interaction.description}>
												<Accordion.Trigger>
													<span class:text-red-500={interaction.severity.toLowerCase() == 'high'}
														>Severity: {interaction.severity}</span
													>
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
								</Card.Content>
							</Card.Root>
						{/each}
						{#if hasSevereInteraction}
							<p>
								<b
									>DANGER: Consuming this medication can cause potentially deadly drug interactions.</b
								>
							</p>

							<p>
								To continue, confirm that you are no longer taking any conflicting medicine by
								deleting all medicine with severe interactions.
							</p>
						{/if}
					</div>
				{:else}
					<p>Analyzing interactions...</p>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<Button>Remove items</Button>
			<AlertDialog.Action disabled={hasSevereInteraction}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
