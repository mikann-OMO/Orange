import type { APIRoute } from "astro";
import { UAParser } from "ua-parser-js";
import type { Message } from "../../types/message";
import { addMessage, getMessages } from "../../utils/local-db";

export const prerender = false;

const MAIL_HOST = process.env.SMTP_HOST;
const MAIL_PORT = Number(process.env.SMTP_PORT || "465");
const MAIL_SECURE = process.env.SMTP_SECURE === "true" || MAIL_PORT === 465;
const MAIL_USER = process.env.SMTP_USER;
const MAIL_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM;
const MAIL_NOTIFY_TO = process.env.MAIL_NOTIFY_TO;
const BLOG_OWNER_EMAIL = process.env.BLOG_OWNER_EMAIL || MAIL_NOTIFY_TO;

let mailTransporter: ReturnType<
	typeof import("nodemailer").createTransport
> | null = null;

async function getMailTransporter() {
	if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS || !MAIL_FROM) return null;
	if (mailTransporter) return mailTransporter;
	const nodemailer = await import("nodemailer");
	mailTransporter = nodemailer.createTransport({
		host: MAIL_HOST,
		port: MAIL_PORT,
		secure: MAIL_SECURE,
		auth: {
			user: MAIL_USER,
			pass: MAIL_PASS,
		},
	});
	return mailTransporter;
}

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidQQ(value: string): boolean {
	return /^\d{5,11}$/.test(value);
}

function normalizeEmail(value?: string): string | undefined {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	return normalized || undefined;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function findMessageById(id: string, messages: Message[]): Message | undefined {
	return messages.find((item) => item.id === id);
}

async function sendEmailIfNeeded(input: {
	to?: string;
	subject: string;
	text: string;
	html: string;
}) {
	if (!input.to || !isValidEmail(input.to)) return;
	const transporter = await getMailTransporter();
	if (!transporter) return;
	await transporter.sendMail({
		from: MAIL_FROM,
		to: input.to,
		subject: input.subject,
		text: input.text,
		html: input.html,
	});
}

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const slug = url.searchParams.get("slug") || undefined;
	const messages = await getMessages(slug);
	return new Response(JSON.stringify(messages), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json();
		const { nickname, qq, content, email, website, parentId, slug } = body;
		const allMessages = await getMessages();

		const uaString = request.headers.get("user-agent") || "";
		const parser = new UAParser(uaString);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		const browserName = browser.name
			? `${browser.name} ${browser.major || browser.version || ""}`.trim()
			: undefined;
		const osName = os.name
			? `${os.name} ${os.version || ""}`.trim()
			: undefined;
		const deviceName = device.model
			? `${device.vendor || ""} ${device.model}`.trim()
			: undefined;

		if (!nickname || !content) {
			return new Response(JSON.stringify({ error: "昵称和内容不能为空" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		const finalQQ = qq ? String(qq).trim() : undefined;
		if (finalQQ && !isValidQQ(finalQQ)) {
			return new Response(JSON.stringify({ error: "QQ号格式不正确" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		const finalEmail = email ? String(email).trim() : undefined;
		if (finalEmail && !isValidEmail(finalEmail)) {
			return new Response(JSON.stringify({ error: "邮箱格式不正确" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		let avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`;
		if (finalQQ) {
			avatar = `https://q1.qlogo.cn/g?b=qq&nk=${finalQQ}&s=100`;
		}

		let finalWebsite = website ? website.slice(0, 100) : undefined;
		if (
			finalWebsite &&
			!finalWebsite.startsWith("http://") &&
			!finalWebsite.startsWith("https://")
		) {
			finalWebsite = `https://${finalWebsite}`;
		}

		const newMessage = await addMessage({
			nickname: nickname.slice(0, 20),
			qq: finalQQ,
			content: content.slice(0, 500),
			email: finalEmail ? finalEmail.slice(0, 100) : undefined,
			website: finalWebsite,
			avatar,
			parentId,
			slug,
			os: osName,
			browser: browserName,
			device: deviceName,
		});

		try {
			const senderEmail = normalizeEmail(newMessage.email);
			const ownerEmail = normalizeEmail(BLOG_OWNER_EMAIL);
			const senderIsOwner = !!ownerEmail && senderEmail === ownerEmail;
			if (parentId) {
				const parentMessage = findMessageById(parentId, allMessages);
				const replyTarget = normalizeEmail(parentMessage?.email);
				if (parentMessage && replyTarget && replyTarget !== senderEmail) {
					await sendEmailIfNeeded({
						to: replyTarget,
						subject: "你收到一条新的留言回复",
						text: `你好 ${parentMessage.nickname}，${newMessage.nickname} 回复了你。\n\n回复内容：${newMessage.content}\n\n原留言：${parentMessage.content}`,
						html: `<p>你好 ${escapeHtml(parentMessage.nickname)}，${escapeHtml(newMessage.nickname)} 回复了你。</p><p>回复内容：${escapeHtml(newMessage.content)}</p><p>原留言：${escapeHtml(parentMessage.content)}</p>`,
					});
				}
			} else if (!senderIsOwner && ownerEmail) {
				await sendEmailIfNeeded({
					to: ownerEmail,
					subject: "你收到一条新的留言",
					text: `你好，收到来自 ${newMessage.nickname} 的新留言。\n\n内容：${newMessage.content}\n\n页面：${newMessage.slug || "message-board"}`,
					html: `<p>你好，收到来自 ${escapeHtml(newMessage.nickname)} 的新留言。</p><p>内容：${escapeHtml(newMessage.content)}</p><p>页面：${escapeHtml(newMessage.slug || "message-board")}</p>`,
				});
			}
		} catch (mailError) {
			console.error("Mail notify failed:", mailError);
		}

		return new Response(JSON.stringify(newMessage), {
			status: 201,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Error in POST /api/messages:", error);
		return new Response(JSON.stringify({ error: "服务器内部错误" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
