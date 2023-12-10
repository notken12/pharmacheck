import type { UserData } from '$lib';
import { writable, type Writable } from 'svelte/store';

export const userData: Writable<UserData> = writable({
	scanHistory: [],
	allergies: []
});
