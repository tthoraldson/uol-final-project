async function analyze(abc: string, wav: File | Blob) {
  const formData = new FormData();

  formData.append("original_abc", abc);
  formData.append("audio", wav, "recording.mp3");

  const response = await fetch("http://localhost:8070/analyze", {
    method: "POST",
    headers: {
      Accept: "*/*",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const res = await response.json();

  return res;
}

export default analyze;
