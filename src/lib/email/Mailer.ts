import { Resend } from "resend";
import env from "@/config/env.ts";
import { type EmailTemplateProps, emailTemplates } from "./templates";
import { Result } from "@/lib/utils/result.ts";

interface SendTemplateOptions<T extends keyof EmailTemplateProps> {
	template: T;
	options: {
		props: EmailTemplateProps[T];
		subject?: string;
		to: string[];
	};
}

class Mailer {
	private _resend: Resend;
	private readonly _senderMailId: string;
	private readonly _senderName: string;

	constructor(senderMailId: string, senderName: string) {
		this._senderMailId = senderMailId;
		this._senderName = senderName;
		this._resend = new Resend(env.RESEND_API_KEY);
	}

	async send<T extends keyof EmailTemplateProps>({
		template,
		options: { props, to, subject },
	}: SendTemplateOptions<T>) {
		const from = `${this._senderName} <${this._senderMailId}>` as string;
		const { data, error } = await this._resend.emails.send({
			from,
			to,
			subject: subject || emailTemplates[template].subject,
			react: emailTemplates[template].component(props),
		});

		if (error) return Result.error(error);
		return Result.success(data?.id);
	}

	async batchSend<T extends keyof EmailTemplateProps>(options: Array<SendTemplateOptions<T>>) {
		const from = `${this._senderName} <${this._senderMailId}>` as string;
		const { data, error } = await this._resend.batch.send(
			options.map(({ template, options: { props, to, subject } }) => ({
				from,
				to,
				subject: subject || emailTemplates[template].subject,
				react: emailTemplates[template].component(props),
			}))
		);

		if (error) return Result.error(error);
		return Result.success(data?.id);
	}
}

export default Mailer;
