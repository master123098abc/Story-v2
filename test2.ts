import fetch from 'node-fetch';

async function testEndpoint(url: string, payload: any) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer fake"
    },
    body: JSON.stringify(payload)
  });
  console.log(`URL: ${url}`);
  console.log(`Status: ${response.status}`);
  try {
     console.log(await response.json());
  } catch(e) {
     console.log(await response.text());
  }
}

testEndpoint("https://ai.api.nvidia.com/v1/genai/stabilityai/sdxl-turbo", {
  text_prompts: [{ text: "test", weight: 1 }],
  seed: 0,
  steps: 2
});

testEndpoint("https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-xl", {
  text_prompts: [{ text: "test", weight: 1 }],
  seed: 0,
  steps: 20
});
