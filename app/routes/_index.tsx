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
  const [rant, setRant] = useState("");
  return (
    <div>
      <h1>rant2outline</h1>
      <p>Turn those rants into meetup talk outlines!</p>
      <Form method="post" action="/summarize">
        <span style={{ marginBottom: "4rem" }}>
          Enter your rant here, the longer the better:
        </span>
        <br />
        <br />
        <textarea
          style={{ width: "100%", height: "20rem", resize: "none" }}
          name="rant"
          required
          readOnly={loading}
          value={rant}
          onChange={(e) => setRant(e.target.value)}
        ></textarea>
        <br />
        <br />
        <button
          style={{
            marginLeft: "auto",
            marginRight: "auto",
          }}
          type="submit"
          onClick={() => {
            setLoading(true);
            setInterval(() => {
              setPeriodCount((prev) => {
                if (prev >= 20) {
                  return 0;
                }
                return prev + 1;
              });
            }, 500);
          }}
        >
          Summarize
        </button>
        {loading && (
          <span
            style={{
              display: "block",
              textAlign: "center",
            }}
          >
            {" "}
            Loading...{".".repeat(periodCount)}
          </span>
        )}
      </Form>
    </div>
  );
}
