// send-excel-email (Edge Function using Resend)

import { Resend } from "npm:resend";
import ExcelJS from "npm:exceljs@4.3.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface RequestPayload {
  recipients: string[];
  subject?: string;
  message?: string;
  columns?: string[];
  rows?: Array<Record<string, any>>;
  lang?: string;
}

function getEnv(name: string, fallback = ""): string {
  return Deno.env.get(name) ?? fallback;
}

const excelTexts: Record<string, string[]> = {
  am: [
    "Շնորհակալություն մեր ծրագրից օգտվելու համար։ Ներքևում կգտնեք նախահաշվի excel տարբերակը։",
    "Հարցերի, օգնության կամ առաջարկների համար կարող եք մեզ գրել կամ զանգահարել։",
    "Էլ-հասցե: shinapp.support@gmail.com",
    "Հեռ․: +374(93)-23-34-02"
  ],
  en: [
    "Thank you for using our app. Below you will find the excel version of the estimate.",
    "For questions, help or suggestions you can write or call us.",
    "Email: shinapp.support@gmail.com",
    "Tel: +374(93)-23-34-02"
  ],
  ru: [
    "Спасибо за использование нашего приложения. Ниже вы найдете excel-версию сметы.",
    "По вопросам, за помощью или с предложениями вы можете написать или позвонить нам.",
    "Эл. почта: shinapp.support@gmail.com",
    "Тел.: +374(93)-23-34-02"
  ]
};

const emailSubjects: Record<string, string> = {
  am: "Նախահաշվարկի տվյալներ ShinApp-ից",
  en: "Your Repair Estimate from ShinApp",
  ru: "Ваша смета на ремонт от ShinApp"
};

async function buildExcelBuffer(
  columns: string[] | undefined,
  rows: Array<Record<string, any>>,
  lang: string
): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sheet1");

  const textLines = excelTexts[lang] || excelTexts["am"];
  textLines.forEach((line) => {
    sheet.addRow([line]);
  });
  sheet.addRow([]); // Empty row for spacing

  if (!columns || columns.length === 0) {
    columns = rows.length === 0 ? ["value"] : Object.keys(rows[0]);
  }

  sheet.addRow(columns);
  const headerRow = sheet.lastRow;
  if (headerRow) {
    headerRow.font = { bold: true };
  }

  for (const r of rows) {
    const rowValues = columns.map((c) => {
      const val = r[c];
      if (val === null || val === undefined) return "";
      if (typeof val === "object") return JSON.stringify(val);
      return val;
    });
    sheet.addRow(rowValues);
  }

  sheet.columns?.forEach((col) => {
    const maxLength =
      col.values?.reduce((prev: number, cur: any) => {
        if (!cur) return prev;
        return Math.max(prev, String(cur).length);
      }, 10) ?? 10;

    col.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

async function sendEmailWithAttachment(
  recipients: string[],
  subject: string,
  text: string,
  filename: string,
  buffer: Uint8Array,
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
    attachments: [
      {
        filename,
        content: btoa(String.fromCharCode(...buffer)),
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

console.info("send-excel-email function started");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed, use POST" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    let payload: RequestPayload | null = null;

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const recipients = form
        .get("recipients")
        ?.toString()
        .split(",")
        .map((s) => s.trim()) ?? [];

      const subject = form.get("subject")?.toString();
      const message = form.get("message")?.toString();
      const lang = form.get("lang")?.toString();

      let columns: string[] | undefined;
      const columnsField = form.get("columns");

      if (columnsField) {
        try {
          columns = JSON.parse(columnsField.toString());
        } catch {
          columns = columnsField.toString().split(",").map((s) => s.trim());
        }
      }

      let rows: Array<Record<string, any>> = [];
      const rowsField = form.get("rows");
      const file = form.get("file") as File | null;

      if (rowsField) {
        try {
          rows = JSON.parse(rowsField.toString());
        } catch {}
      } else if (file) {
        const text = await file.text();

        try {
          rows = JSON.parse(text);
        } catch {
          const lines = text.split(/\r?\n/).filter(Boolean);
          if (lines.length > 0) {
            const headers = lines[0].split(",");
            rows = lines.slice(1).map((line) => {
              const values = line.split(",");
              const obj: Record<string, any> = {};
              headers.forEach((h, i) => (obj[h.trim()] = values[i]?.trim()));
              return obj;
            });
            if (!columns) columns = headers;
          }
        }
      }

      payload = { recipients, subject, message, columns, rows, lang };
    } else {
      try {
        payload = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ error: "Unsupported content type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!payload || !payload.recipients?.length) {
      return new Response(
        JSON.stringify({ error: "Missing recipients" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lang = payload.lang || "am";
    const localizedSubject = emailSubjects[lang] || emailSubjects["am"];
    
    const localizedMessageLines = excelTexts[lang] || excelTexts["am"];
    const localizedMessage = localizedMessageLines.join("\n");

    const finalSubject = localizedSubject;
    const finalMessage = (payload.message ? payload.message + "\n\n" : "") + localizedMessage;

    const buffer = await buildExcelBuffer(
      payload.columns,
      payload.rows ?? [],
      lang
    );

    const filename = `Estimate_${Date.now()}.xlsx`;

    const info = await sendEmailWithAttachment(
      payload.recipients,
      finalSubject,
      finalMessage,
      filename,
      buffer
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
