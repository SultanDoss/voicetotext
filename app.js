document.getElementById("uploadBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("audioFile");
  const file = fileInput.files[0];
  if (!file) return alert("اختر ملف صوت أولاً!");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/transcribe", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  document.getElementById("result").textContent = data.text || "حدث خطأ!";
});
