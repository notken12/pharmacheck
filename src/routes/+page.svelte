<script lang="ts">
	import { saveUserData } from '$lib';
	import Scanner from '$lib/components/Scanner.svelte';
	import { userData } from '$lib/stores';
	import store from 'store';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { History } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';

	onMount(() => {
		let storedUserData = store.get('userData');
		console.log(storedUserData);
		console.log($userData);

		if (storedUserData != null && storedUserData.scanHistory != null) {
			userData.set(storedUserData);
		} else {
			saveUserData($userData);
		}
		console.log($userData);
	});
</script>

<main class="flex p-8 center flex-col items-center">
	<Button>
		<History class="mr-2 h-4 w-4" />
		History
	</Button>
	<h1 class="text-3xl font-bold md:text-5xl">Medication Scanner</h1>
	<p>Scan your medication here</p>
	<Scanner></Scanner>
	<div class="flex flex-col gap-4">
		{#if $userData}
			<h2 class="text-2xl font-bold">Scan history</h2>
			{#each $userData.scanHistory as scanRecord}
				<Card.Root>
					<Card.Header>
						<Card.Title>{scanRecord.medicineInfo.name}</Card.Title>
						<Card.Description
							>Scanned at {new Date(scanRecord.timestamp).toISOString()}</Card.Description
						>
					</Card.Header>
					<!-- <Card.Content>
			  <p>Card Content</p>
			</Card.Content> -->
				</Card.Root>
			{/each}
		{/if}
	</div>
</main>
