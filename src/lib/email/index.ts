import Mailer from "@/lib/email/Mailer.ts";
import env from "@/config/env.ts";

const mailer = new Mailer(env.SENDER_MAIL_ID, env.SENDER_NAME);

export default mailer;
