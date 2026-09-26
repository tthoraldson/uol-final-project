async function callBasicPitch(prompt: string) {
  const params = new URLSearchParams({
    prompt,
  });

  const response = await fetch(
    `http://0.0.0.0:8070/basic-pitch/generate?${params}`, // TODO: update to use docker compatible URL
    {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return await response.json();
}

export default callBasicPitch;
