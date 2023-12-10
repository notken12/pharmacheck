<script lang="ts">
	import { saveUserData } from '$lib';
	import Scanner from '$lib/components/Scanner.svelte';
	import { userData } from '$lib/stores';
	import store from 'store';
	import { onMount } from 'svelte';

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

<h1>Welcome to Medication Scanner</h1>
<p>Scan your medication here</p>
<Scanner></Scanner>
{#if $userData}
	{#each $userData.scanHistory as scanRecord}
		<p>Scanned {scanRecord.medicineInfo.name} at {new Date(scanRecord.timestamp).toISOString()}</p>
	{/each}
{/if}
