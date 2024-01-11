const getAuthToken = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      if (!token) {
        return reject(new Error("Failed to get auth token"));
      }
      resolve(token);
    });
  });
};

// URL for Google Drive API
const driveApiUrl = "https://www.googleapis.com/drive/v3";

// Function to list files
const listFiles = async (token: string) => {
  const response = await fetch(`${driveApiUrl}/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to list files");
  return await response.json();
};

// Function to create a file
const createFile = async (token: string, fileName: string) => {
  const fileMetadata = {
    name: fileName,
    mimeType: "application/vnd.google-apps.document",
  };

  const response = await fetch(`${driveApiUrl}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fileMetadata),
  });
  if (!response.ok) throw new Error("Failed to create file");
  return await response.json();
};

// Function to delete a file
const deleteFile = async (token: string, fileId: string) => {
  const response = await fetch(`${driveApiUrl}/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete file");
  return response;
};

const main = async () => {
  try {
    const token = await getAuthToken();
    const fileList = await listFiles(token);
    console.log(fileList);

    // Example: Create a file
    const newFile = await createFile(token, "New Document");
    console.log("Created File:", newFile);

    // // Example: Delete the created file
    // await deleteFile(token, newFile.id);
    // console.log("Deleted File:", newFile.id);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
