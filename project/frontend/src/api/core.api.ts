async function analyze(
  abc: string,
  baseline_midi: File | Blob,
  wav: File | Blob,
) {
  const formData = new FormData();

  formData.append("original_abc", abc);
  formData.append("baseline_midi", baseline_midi, "baseline.mid");
  formData.append("audio", wav, "recording.wav");

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

  console.warn("response from analyze", res);

  return res;
}

export default analyze;
