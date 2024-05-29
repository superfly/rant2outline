import { Ollama } from "ollama";
import { z } from "zod";

const synthesizePrompt = ({
    tools,
    rant,
}: {
    tools: any[],
    rant: string,
}) =>
    // Xe\ Okay this is a bit galaxy brain so I'm going to explain this in detail. Ollama supports
    // "tokenizing" your prompt for you, or taking the user-provided prompt and splitting it into
    // the raw form that the model expects. This is done by taking the messages as a list of objects
    // and then applying each object to the prompt template in order.
    //
    // The cursed thing I'm doing here is manually defining my own prompt with the [AVAILABLE_TOOLS]
    // magic token. This token is understood by the model as a list of tools that are available to
    // use with responses.
    //
    // The other main cursed thing is that I am ending this "prompt" with the [TOOL_CALLS] magic token.
    // This tells the model that it's expected to generate a tool invocation JSON array, which I can
    // then parse because Ollama is set into "only allow JSON to be generated" mode.
    //
    // This effectively puts the model into a stranglehold that will force it to generate _something_
    // that we can parse into either a Talk object or a MistralToolUse object. I'm not sure why it's
    // sometimes generating the Talk object directly, but fuck it, we ball.
    `[AVAILABLE_TOOLS]${JSON.stringify(tools)}[/AVAILABLE_TOOLS][INST] Can you summarize my rant?

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

// Xe\ This is the list of tools that are available when the model is running. In an ideal world, this
// would be generated from the Zod schema. However at this point, I'm chaining together a bunch of things
// I've either never used before or have only basic knowledge of, so I'm just going to hardcode this
// for now in a last-ditch attempt to regain some kind of cognitive simplicity.
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

// fabricate generates a Talk from the given `rant`.
//
// This function potentially has infinite runtime, as it will keep trying to generate a Talk until it
// succeeds. This is because the model may return a JSON object that is not a Talk, in which case it
// will try again.
//
// In my limited testing, this usually gets the result you want in one or two tries. There's some
// room for improvement here, but I'm not sure what that would look like. Probably would need the
// ability to use arbitrary BNF grammars in Ollama, because you can compile JSON schemae to BNF
// with some code published by the team behind llama.cpp.
export default async function fabricate({
    rant,
    model = "mistral",
    ollamaHost = "http://localhost:11434",
}: FabricateArgs): Promise<Talk> {
    const cli = new Ollama({ host: ollamaHost });
    let result: Talk | null = null;

    // Pull the model to make sure it's up to date. This may take a hot minute on first run.
    await cli.pull({ model, stream: false });

    const prompt = synthesizePrompt({ tools, rant });

    while (result === null) {
        try {
            const response = await cli.generate({
                model,
                prompt,
                format: "json",
            });

            console.log("model response:", JSON.stringify(JSON.parse(response.response)));

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
            if (data.name.toLowerCase() === "summarize_rant") {
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