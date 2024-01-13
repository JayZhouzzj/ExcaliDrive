console.log("loaded");
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById(
    "createFileButton"
  ) as HTMLButtonElement;
  button.addEventListener("click", async () => {
    console.log("clicked");
    const fileName = document.getElementById("fileName") as HTMLInputElement;
    const file = await createFile(fileName.value);
    console.log(file);
  });
});
