export interface User {
	name: string;
	uuid: string;
	email: string;
	phone: string;
	cbu: string;
	secret_token: string;
	alias: string;
	creation_date: Date;
}

export interface UserPublic {
	name: string;
	cbu: string;
}
export interface Transaction {
	originIdentifier: AccountWithOneIdentifier;
	destinationIdentifier: AccountWithOneIdentifier;
	amount: number;
}

export interface QueueTransaction {
	originCBU: string;
	destinationCBU: string;
	balance: number;
	date: Date;
}

export interface AccountIdentifiers {
	uuid?: string;
	name?: string;
	cbu?: string;
	phone?: string;
	email?: string;
}

export type AccountWithOneIdentifier = Required<
	Pick<AccountIdentifiers, 'cbu' | 'email' | 'name' | 'phone' | 'uuid'>
>;
export type NewUserInfo = {
	secretToken: string;
	phoneNumber: string;
	email: string;
	name: string;
};
