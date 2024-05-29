import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [periodCount, setPeriodCount] = useState(0);
  return (
    <div>
      <h1>rant2outline</h1>
      <p>Turn those rants into meetup talk outlines!</p>
      <Form method="post" action="/summarize">
        <span style={{ marginBottom: "4rem" }}>Enter your rant here:</span>
        <br />
        <br />
        <textarea
          name="rant"
          rows={20}
          cols={80}
          required
          readOnly={loading}
        ></textarea>
        <br />
        <br />
        <button
          type="submit"
          onClick={() => {
            setLoading(true);
            setInterval(() => {
              setPeriodCount((prev) => prev + 1);
            }, 250);
          }}
        >
          Summarize
        </button>
        {loading && <span> Loading...{".".repeat(periodCount)}</span>}
      </Form>
    </div>
  );
}
