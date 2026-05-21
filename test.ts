import fetch from 'node-fetch';

async function test() {
  const response = await fetch("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text_prompts: [
        { text: "test", weight: 1 }
      ]
    })
  });
  console.log(response.status);
  console.log(await response.text());
}
test();
