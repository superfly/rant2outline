# rant2outline

This is an example of how you can use [Mistral function calling](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3)
to fabricate JSON objects based on unstructured text. This example is
deliberately simple and is meant to be a starting point for understanding
how to incorporate the idea of "fabrication" as one of the best features
of large language models.

## Fabrication

I go into more detail in my meetup talk, but the basic idea is that
large language models are infinite randomness machines, and when you
get "undesired" output, we call this "hallucination". But when you
get "desired" output, we call this "fabrication". The key is to leverage
the randomness of the model to generate the desired output.

## How to use this code

To run this locally, you need to have the following installed:

- [Ollama](https://ollama.com)
- [Mistral 7B 0.3](https://ollama.com/library/mistral:v0.3)
- [NodeJS](https://nodejs.org)

Then you can run the following commands:

```bash
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173) in your browser to see the
UI. Start ranting into the box and then apply force to the "Summarize"
button. The code will then use Mistral to generate a JSON object based
on your rant.

## Deploying to Fly.io

Run `npm run yeet` to deploy this to Fly.io. You will need to have the
Fly CLI installed and be logged in. This will create the following
resources:

- A Fly.io with a GPU to run Mistral (defaults to a L40s in SEA unless
  you say otherwise in the prompts), it will automatically stop when
  not in use.
- A 16 GB volume to store the Mistral model in (this is overkill given
  that the model weights we're using are only about 4GB, but there's
  no kill like overkill).
- A flycast address for that GPU app so that it's not exposed to the
  public internet.
- A Fly.io app for the rant2outline service, it will also automatically
  stop when not in use.

## License

Apache 2.0. Learn from this what thou wilt.
