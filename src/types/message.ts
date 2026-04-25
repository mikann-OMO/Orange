export interface DeviceInfo {
	browser: string | null;
	os: string | null;
	device: string | null;
}

export interface Message {
	id: string;
	slug: string;
	content: string;
	nickname: string;
	email: string;
	website: string | null;
	avatar: string;
	device: DeviceInfo;
	createdAt: string;
	parentId: string | null;
	replies?: Message[];
}

export interface CreateMessageDto {
	slug: string;
	content: string;
	nickname: string;
	email: string;
	website: string | null;
	parentId: string | null;
}
