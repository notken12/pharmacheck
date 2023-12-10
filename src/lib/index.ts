// place files you want to import through the `$lib` alias in this folder.
import store from 'store';

export type Ingredient = {
	name: string;
	rxNormId: string;
};

export type MedicineInfo = {
	name: string;
	ingredients: Ingredient[];
};

export type ScanRecord = {
	medicineInfo: MedicineInfo;
	timestamp: EpochTimeStamp;
};

export type UserData = {
	scanHistory: ScanRecord[];
	allergies: string[];
};

export const saveUserData = (userData: UserData) => {
	store.set('userData', userData);
};
