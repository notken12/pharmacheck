<script lang="ts">
	import { userData } from '$lib/stores';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { X } from 'lucide-svelte';
	import type { ScanRecord } from '$lib';

	const deleteRecord = (scanRecord: ScanRecord) => {
		$userData.scanHistory.splice($userData.scanHistory.indexOf(scanRecord), 1);
		userData.set($userData);
	};

	const timeSince = (date: Date) => {
		var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

		var interval = seconds / 31536000;

		interval = seconds / 2592000;
		interval = seconds / 86400;
		if (interval >= 2) {
			return ' on ' + date.toLocaleDateString();
		}
		if (interval > 1) {
			return Math.floor(interval) + ' days ago';
		}
		interval = seconds / 3600;
		if (interval > 1) {
			return Math.floor(interval) + ' hours ago';
		}
		interval = seconds / 60;
		if (interval > 1) {
			return Math.floor(interval) + ' minutes ago';
		}
		return 'just now';
	};
</script>

<div class="flex flex-col gap-4">
	{#if $userData}
		{#if $userData.scanHistory.length > 0}
			<h2 class="text-2xl font-bold text-center mt-4">Recently scanned</h2>
		{/if}
		{#each $userData.scanHistory as scanRecord}
			<Card.Root>
				<Card.Header class="flex flex-row justify-between items-center gap-4">
					<div class="flex flex-col gap-2">
						<Card.Title
							>{scanRecord.medicineInfo.name} ({scanRecord.medicineInfo.ingredients
								.map((a) => a.name)
								.join(', ')})</Card.Title
						>
						<Card.Description>Scanned {timeSince(new Date(scanRecord.timestamp))}</Card.Description>
					</div>
					<Button
						style="margin:0;"
						size="icon"
						variant="outline"
						on:click={() => deleteRecord(scanRecord)}><X class="h-4 w-4"></X></Button
					>
				</Card.Header>
			</Card.Root>
		{/each}
	{/if}
</div>
