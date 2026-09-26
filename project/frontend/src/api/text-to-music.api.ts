async function generateMusic(prompt: string) {
  const params = new URLSearchParams({
    prompt,
  });

  const response = await fetch(
    `http://localhost:8070/music-to-text/generate?${params}`, // TODO: update to use docker compatible URL
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

  const res = await response.json();
  console.warn("response from text-to-music", res);

  console.warn(res["tune"]);
  return res["tune"];
}

export default generateMusic;
