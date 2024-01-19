let authToken: string | null = null;
let fileId: string | null = null;

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
  const blob = new Blob([drawingData], { type: "application/json" });

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

const updateDrawingFile = async (fileId: string, drawingData: string) => {
  const blob = new Blob([drawingData], { type: "application/json" });

  const formData = new FormData();
  formData.append("file", blob);

  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
    {
      method: "PATCH",
      headers: new Headers({
        Authorization: `Bearer ${authToken}`,
      }),
      body: formData,
    }
  );

  if (!response.ok) throw new Error("Failed to update file");
  return await response.json();
};

const downloadFile = async (fileId: string) => {
  const response = await fetch(`${driveApiUrl}/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) throw new Error("Failed to download file");
  return await response.text(); // Assuming the file is in text format (JSON)
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
      const fileName = "TmpExcalidraw.excalidrive"; // or any other name you wish to use
      const file = await createDrawingFile(fileName, drawingData);
      console.log("File created: ", file);
      sendResponse({ status: "success", fileId: file.id });
    } catch (error) {
      console.error("Error in creating file: ", error);
      sendResponse({ status: "error", error: error });
    }
  } else if (message.action === "loadDrawing") {
    try {
      const query = "name contains '.excalidraw'";
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to list Excalidraw files");
      const files = await response.json();
      if (files.files.length > 0) {
        // Take the first file in the list
        const firstFileId = files.files[0].id;
        fileId = firstFileId;
        const fileData = await downloadFile(firstFileId);
        if (sender.tab && sender.tab.id != undefined) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "loadDrawingData",
            data: fileData,
          });
        }
      } else {
        console.log("No Excalidraw files found.");
      }
    } catch (error) {
      console.error("Error in loading file: ", error);
      sendResponse({ status: "error", error: error });
    }
  }
  return true;
});
