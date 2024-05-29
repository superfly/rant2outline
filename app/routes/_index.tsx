import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Rant2Outline" },
    {
      name: "description",
      content: "Turn those rants into meetup talk outlines!",
    },
  ];
};

export default function Index() {
  return (
    <div>
      <h1>rant2outline</h1>
      <p>Turn those rants into meetup talk outlines!</p>
      <Form method="post" action="/summarize">
        <span style={{ marginBottom: "4rem" }}>Enter your rant here:</span>
        <br />
        <br />
        <textarea name="rant" rows={20} cols={80} required></textarea>
        <br />
        <br />
        <button type="submit">Summarize</button>
      </Form>
    </div>
  );
}
