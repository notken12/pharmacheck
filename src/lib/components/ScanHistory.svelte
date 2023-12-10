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
</script>

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
				<Card.Footer>
					<Button on:click={() => deleteRecord(scanRecord)}><X class="h-4 w-4"></X></Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	{/if}
</div>
