declare const gapi: any; // Declare gapi (from Google API JS client)

export class DriveApi {
  private static instance: DriveApi;

  private constructor() {}

  public static getInstance(): DriveApi {
    if (!DriveApi.instance) {
      DriveApi.instance = new DriveApi();
    }
    return DriveApi.instance;
  }

  public initializeClient(clientId: string, apiKey: string) {
    return new Promise<void>((resolve, reject) => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: apiKey,
            clientId: clientId,
            scope: "https://www.googleapis.com/auth/drive.file",
          })
          .then(() => {
            resolve();
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    });
  }

  // Method to list files
  public listFiles() {
    return gapi.client.drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
    });
  }

  // Additional methods for other Drive operations...
}
