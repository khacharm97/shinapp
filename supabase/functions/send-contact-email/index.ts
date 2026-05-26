import { Resend } from "npm:resend";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface RequestPayload {
  recipients: string[];
  lang?: string;
  firstName?: string;
  lastName?: string;
}

function getEnv(name: string, fallback = ""): string {
  return Deno.env.get(name) ?? fallback;
}

const contactTexts: Record<string, string[]> = {
  am: [
    "Շնորհակալություն մեր ծրագրից օգտվելու համար։ Մեր մասնագետները այս պահին ուսումնասիրում են Ձեր հաղորդագրությունը և շուտով կապ կհաստատեն Ձեր հետ։",
    "Հարցերի, օգնության կամ առաջարկների համար կարող եք մեզ գրել կամ զանգահարել։",
    "Էլ-հասցե: shinapp.support@gmail.com",
    "Հեռ․: +374(93)-23-34-02"
  ],
  en: [
    "Thank you for using our app. Our specialists are currently reviewing your message and will contact you shortly.",
    "For questions, help or suggestions you can write or call us.",
    "Email: shinapp.support@gmail.com",
    "Tel: +374(93)-23-34-02"
  ],
  ru: [
    "Спасибо за использование нашего приложения. Наши специалисты в настоящее время изучают ваше сообщение и скоро свяжутся с вами.",
    "По вопросам, за помощью или с предложениями вы можете написать или позвонить нам.",
    "Эл. почта: shinapp.support@gmail.com",
    "Тел.: +374(93)-23-34-02"
  ]
};

const contactSubjects: Record<string, string> = {
  am: "Ձեր հաղորդագրությունը ստացված է - ShinApp",
  en: "We received your message - ShinApp",
  ru: "Мы получили ваше сообщение - ShinApp"
};

async function sendEmail(
  recipients: string[],
  subject: string,
  text: string,
  replyToEmail?: string
) {
  const apiKey = getEnv("RESEND_API_KEY");
  const fromEmail = "noreply@shinapp.am";
  const fromName = getEnv("FROM_NAME", "ShinApp");

  if (!apiKey || !fromEmail) {
    throw new Error("Missing RESEND_API_KEY or FROM_EMAIL");
  }

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5">
      <h2>${subject}</h2>
      <p>${text.replace(/\n/g, "<br/>")}</p>
      <hr/>
      <p style="font-size:12px;color:#888">
        Sent from Shinapp system
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: recipients,
    subject: subject,
    text,
    html,
    reply_to: replyToEmail || fromEmail,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

console.info("send-contact-email function started");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed, use POST" }),
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let payload: RequestPayload;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload || !payload.recipients?.length) {
      return new Response(
        JSON.stringify({ error: "Missing recipients" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = payload.lang || "am";
    const subject = contactSubjects[lang] || contactSubjects["am"];
    
    const textLines = contactTexts[lang] || contactTexts["am"];
    let text = textLines.join("\n");
    
    if (payload.firstName) {
      const greeting = lang === "am" ? `Բարև ${payload.firstName},` : lang === "ru" ? `Здравствуйте, ${payload.firstName},` : `Hello ${payload.firstName},`;
      text = greeting + "\n\n" + text;
    }

    const info = await sendEmail(
      payload.recipients,
      subject,
      text
    );

    return new Response(JSON.stringify({ ok: true, data: info }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
