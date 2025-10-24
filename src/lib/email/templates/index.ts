import { SlackConfirmEmail, type SlackConfirmEmailProps } from "./confirmation.tsx";
import { VercelInviteUserEmail, type VercelInviteUserEmailProps } from "./invite.tsx";
import { NotionMagicLinkEmail, type NotionMagicLinkEmailProps } from "./magic-link.tsx";
import { LinearLoginCodeEmail, type LinearLoginCodeEmailProps } from "./login-code.tsx";
import { DropboxResetPasswordEmail, type DropboxResetPasswordEmailProps } from "./reset-password.tsx";
import type { ReactElement } from "react";

export type EmailTemplateProps = {
	confirmationMail: SlackConfirmEmailProps;
	inviteMail: VercelInviteUserEmailProps;
	magicLinkMail: NotionMagicLinkEmailProps;
	otpLoginMail: LinearLoginCodeEmailProps;
	resetPasswordMail: DropboxResetPasswordEmailProps;
};

export const emailTemplates: {
	[K in keyof EmailTemplateProps]: {
		component: (props: EmailTemplateProps[K]) => ReactElement;
		subject: string;
	};
} = {
	confirmationMail: {
		component: SlackConfirmEmail,
		subject: "Logic Successful",
	},
	inviteMail: {
		component: VercelInviteUserEmail,
		subject: "You have been invited",
	},
	magicLinkMail: {
		component: NotionMagicLinkEmail,
		subject: "Login via Magic Link",
	},
	otpLoginMail: {
		component: LinearLoginCodeEmail,
		subject: "Verify via OTP",
	},
	resetPasswordMail: {
		component: DropboxResetPasswordEmail,
		subject: "Reset Password",
	},
};
