import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendEmail = async ({ from, to, subject, html }) => {
  try {
    if (!resend) {
      throw new Error("RESEND_API_KEY is missing in environment variables");
    }

    const { data, error } = await resend.emails.send({
      from: from || "Website <website@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error({ error });
      throw new Error(error.message);
    }

    console.log({ data });
    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
