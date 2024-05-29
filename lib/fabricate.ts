import { Ollama } from "ollama";
import { z } from "zod";

const synthesizePrompt = ({
    tools,
    rant,
}: {
    tools: any[],
    rant: string,
}) => `[AVAILABLE_TOOLS]${JSON.stringify(tools)}[/AVAILABLE_TOOLS][INST] Can you summarize my rant?

${rant} [/INST] [TOOL_CALLS]`;

const TalkSchema = z.object({
    title: z.string().describe("A human-readable title of the talk"),
    summary: z.string().describe("The high-level summary of the talk"),
    key_takeaways: z.array(z.string()).describe("A list of things the person attending the talk should learn"),
    sections: z.array(z.string()).describe("A list of sections in the talk, such as the steps to get to the key takeaways"),
});

/**
 * Represents a talk object.
 */
export interface Talk {
    /**
     * A human-readable title of the talk.
     */
    title: string;

    /**
     * The high-level summary of the talk.
     */
    summary: string;

    /**
     * A list of things the person attending the talk should learn.
     */
    key_takeaways: string[];

    /**
     * A list of sections in the talk, such as the steps to get to the key takeaways.
     */
    sections: string[];
}

const tools = [
    {
        "type": "function",
        "function": {
            "name": "summarize_rant",
            "description": "Summarize a rant into a talk outline",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "A human-readable title of the talk",
                    },
                    "summary": {
                        "type": "string",
                        "description": "The high-level summary of the talk",
                    },
                    "key_takeaways": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "A list of things the person attending the talk should learn",
                    },
                    "sections": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                        "description": "A list of sections in the talk, such as the steps to get to the key takeaways",
                    },
                }
            }
        }
    }
];

export interface FabricateArgs {
    rant: string;
    model?: string;
    ollamaHost?: string;
}

export interface MistralToolUse {
    name: string;
    arguments: Talk;
}

export default async function fabricate({
    rant,
    model = "mistral",
    ollamaHost = "http://localhost:11434",
}: FabricateArgs) {
    const cli = new Ollama({ host: ollamaHost });
    let result: Talk | null = null;

    const prompt = synthesizePrompt({ tools, rant });

    while (result === null) {
        try {
            const response = await cli.generate({
                model,
                prompt,
                format: "json",
            });

            console.log(response.response);

            let data: MistralToolUse[] | MistralToolUse = JSON.parse(response.response);

            // Sometimes the model will just return the desired JSON even though it's not supposed to, so handle that gracefully.
            try {
                return TalkSchema.parse(data);
            } catch (error) {
                // swallow the error
            }

            // Otherwise it probably returned an array of tool uses, so we'll just grab the first one.
            if (Array.isArray(data)) {
                data = data[0];
            }

            // If the tool use is the summarize_rant function, we can parse the arguments as a Talk.
            // If not, it'll try again with the next invocation.
            if (data.name === "summarize_rant") {
                const talk = TalkSchema.parse(data.arguments);
                return talk;
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error(`Error validating hallucination:`, error.errors);
            }

            console.error(`Error generating hallucination: ${error}`);
        }
    }

    return result;
}