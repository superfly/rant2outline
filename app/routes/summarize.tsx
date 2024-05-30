import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import fabricate from "@/lib/fabricate";

export const meta: MetaFunction = () => {
  return [
    { title: "Rant2Outline - Your rant summarized" },
    {
      name: "description",
      content: "Turn those rants into meetup talk outlines!",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const rant = body.get("rant");

  if (!rant) {
    return new Response("Rant is required.", { status: 400 });
  }

  console.log("attempting fabrication...");

  try {
    const rantSummary = await fabricate({ rant: `${rant}` });
    console.log("fabrication complete");
    return json(rantSummary);
  } catch (error) {
    return new Response("Failed to summarize rant.", { status: 500 });
  }
}

export default function RantSummary() {
  const data = useActionData<typeof action>();

  if (!data) {
    return <meta httpEquiv="refresh" content="0;url=/" />;
  }

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.summary}</p>
      <h2>Key Takeaways</h2>
      <ul>
        {data.key_takeaways.map((takeaway: string) => (
          <li key={takeaway}>{takeaway}</li>
        ))}
      </ul>

      <h2>Sections</h2>
      <ul>
        {data.sections.map((section: string) => (
          <li key={section}>{section}</li>
        ))}
      </ul>

      <h2>Markdown for your notes</h2>

      <textarea rows={20} cols={80} readOnly>
        {`# ${data.title}

${data.summary}

## Key Takeaways

${data.key_takeaways.map((takeaway: string) => `- ${takeaway}`).join("\n")}

## Sections

${data.sections.map((section: string) => `### ${section}`).join("\n\n")}
`}
      </textarea>
    </div>
  );
}
