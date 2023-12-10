<script lang="ts">
	import { saveUserData } from '$lib';
	import Scanner from '$lib/components/Scanner.svelte';
	import { userData } from '$lib/stores';
	import store from 'store';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { History } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import ScanHistory from '$lib/components/ScanHistory.svelte';

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

		userData.subscribe((v) => {
			saveUserData(v);
		});
	});
</script>

<main class="flex p-8 center flex-col items-center gap-4">
	<!-- <Button>
		<History class="mr-2 h-4 w-4" />
		History
	</Button> -->
	<h1 class="text-3xl font-bold md:text-5xl">Medication Safety Scanner</h1>
	<p>Easily scan your medicine to avoid dangerous drug interactions and allergies</p>
	<Scanner></Scanner>
	<ScanHistory></ScanHistory>
</main>
