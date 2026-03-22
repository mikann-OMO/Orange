interface AnnouncementConfig {
	title: string;
	content: string;
	avatar: string;
	enabled: boolean;
}

declare module "../content/announcement.yaml" {
	const value: AnnouncementConfig;
	export default value;
}

declare module "*.yaml" {
	const value: Record<string, unknown>;
	export default value;
}

declare module "*.yml" {
	const value: Record<string, unknown>;
	export default value;
}
