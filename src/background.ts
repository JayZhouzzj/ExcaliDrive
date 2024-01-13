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

const main = async () => {
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

main();
