<script lang="ts">
	import { saveUserData } from '$lib';
	import Scanner from '$lib/components/Scanner.svelte';
	import { userData } from '$lib/stores';
	import store from 'store';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { History, Info } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import ScanHistory from '$lib/components/ScanHistory.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';

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
	<h1 class="text-3xl font-bold md:text-5xl">PharmaCheck</h1>
	<h2 class="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
		Easily scan your medicine to avoid dangerous drug interactions and allergies
	</h2>
	<p class="text-muted-foreground">Made by Ken Z. and Benja H. at 📍Hack the Nest</p>
	<Scanner></Scanner>
	<ScanHistory></ScanHistory>
	<Dialog.Root>
		<Dialog.Trigger>
			<Button size="icon" variant="outline" class="fixed right-[16px] top-[16px]" aria-label="Info"
				><Info class="w-4 h-4"></Info></Button
			>
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>About PharmaCheck</Dialog.Title>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<p>
					Libraries used: SvelteKit, Tesseract.js (OCR), OpenAI Chat Completions (Extract
					information from OCR text), NIH Drug Interaction API.
				</p>
			</div>
		</Dialog.Content>
	</Dialog.Root>
</main>
