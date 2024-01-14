let authToken: string | null = null;

const getAuthToken = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!token) {
        reject("Failed to get token");
      } else {
        authToken = token;
        resolve();
      }
    });
  });
};

const driveApiUrl = "https://www.googleapis.com/drive/v3";

const listFiles = async () => {
  const response = await fetch(`${driveApiUrl}/files`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) throw new Error("Failed to list files");
  return await response.json();
};

const createFile = async (fileName: string) => {
  const fileMetadata = {
    name: fileName,
    mimeType: "application/vnd.google-apps.document",
  };

  const response = await fetch(`${driveApiUrl}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fileMetadata),
  });
  if (!response.ok) throw new Error("Failed to create file");
  return await response.json();
};

const deleteFile = async (fileId: string) => {
  const response = await fetch(`${driveApiUrl}/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete file");
  return response;
};

const createDrawingFile = async (fileName: string, drawingData: string) => {
  // Convert the JSON string to a Blob
  const blob = new Blob([drawingData], { type: "application/json" });

  // Create a new FormData object
  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob(
      [
        JSON.stringify({
          name: fileName,
          mimeType: "application/json", // or 'application/vnd.google-apps.document' if you want to create a Google Docs file
        }),
      ],
      { type: "application/json" }
    )
  );
  formData.append("file", blob);

  // Make the POST request to the Google Drive API
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${authToken}`,
      }),
      body: formData,
    }
  );

  if (!response.ok) throw new Error("Failed to create file");
  return await response.json();
};

const startup = async () => {
  try {
    await getAuthToken();
    if (!authToken) throw new Error("Failed to get auth token");
    const fileList = await listFiles();
    console.log(fileList);

    // Test to create and delete file
    // const newFile = await createFile("Foo");
    // console.log("Created File:", newFile);
    // await deleteFile(newFile.id);
    // console.log("Deleted File:", newFile.id);
  } catch (error) {
    console.error("Error:", error);
  }
};

startup();
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "saveDrawing") {
    try {
      const drawingData = message.data;
      const fileName = "TmpExcalidraw.json"; // or any other name you wish to use
      const file = await createDrawingFile(fileName, drawingData);
      console.log("File created: ", file);
      sendResponse({ status: "success", fileId: file.id });
    } catch (error) {
      console.error("Error in creating file: ", error);
      sendResponse({ status: "error", error: error });
    }
  }
  return true;
});
