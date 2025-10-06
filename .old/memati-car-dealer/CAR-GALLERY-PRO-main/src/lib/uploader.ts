import { endpoints } from "@/config/endpoints";
import { api } from "./api-client";


interface FilePart {
  PartNumber: number;
  ETag: string;
  signedUrl: string;
}

export interface ProcessArgs {
  sent: number;
  total: number;
  uuid: string;
  percentage: number;
  key?: string;
}
interface UploaderOptions {
  file: File;
  chunkSize?: number;
  threadsQuantity?: number;
  uuid: string;
}

export class Uploader {
  chunkSize: number;
  threadsQuantity: number;
  file: File | null;
  uuid: string;
  uploadedSize: number;
  progressCache: any;
  activeConnections: any;
  counter: number;
  aborted: boolean;
  parts: FilePart[];
  uploadedParts: FilePart[];
  fileId: string | undefined;
  fileKey: string | undefined;
  onProgressFn: (args: ProcessArgs) => void;
  onErrorFn: (error?: Error) => void;
  onCompleteFn: () => void;

  constructor(options: UploaderOptions) {
    // this must be bigger than or equal to 0.1mb
    // otherwise AWS will respond with "Your proposed upload is smaller than the minimum allowed size"
    this.chunkSize = options.chunkSize || 1024 * 1024 * 5;
    // this is # of parallel uploads
    this.threadsQuantity = Math.min(options.threadsQuantity || 10, 50);
    this.file = options.file;
    this.uuid = options.uuid;
    this.aborted = false;
    this.uploadedSize = 0;
    this.progressCache = {};
    this.activeConnections = {};
    this.counter = 0;
    this.parts = [];
    this.uploadedParts = [];
    this.fileId = undefined;
    this.fileKey = undefined;
    this.onProgressFn = () => {};
    this.onErrorFn = () => {};
    this.onCompleteFn = () => {};
  }

  start() {
    this.initUpload();
  }
  async initUpload() {
    try {
      const ext = this.file?.name.split(".").pop();
      const name = this.file?.name.split(".").shift();
      let fileName = "";

      if (ext) {
        fileName += `${name?.replace(/\s+/g, "-")}.${ext}`;
      } else fileName += name;

      const imageInitialisationUploadInput = {
        name: fileName,
        uuid: this.uuid,
      };

      const AWSFiledataOutout = await api.post<{
        fileId: string;
        fileKey: string;
      }>(endpoints.images.initMultipartUpload, {
        json: imageInitialisationUploadInput,
      });

      this.fileId = AWSFiledataOutout.fileId;
      this.fileKey = AWSFiledataOutout.fileKey;

      // retrieve the pre-signed URLs from AWS
      const numberOfParts = Math.ceil(Number(this.file?.size) / this.chunkSize);

      const AWSMultipartFileDataInput = {
        fileId: this.fileId,
        fileKey: this.fileKey,
        parts: numberOfParts,
      };

      const urlsResponse = await api.post<{ parts: FilePart[] }>(
        endpoints.images.getMultipartUpload,
        {
          json: AWSMultipartFileDataInput,
        }
      );

      const newParts = urlsResponse.parts;
      this.parts.push(...newParts);
      this.sendNext();
    } catch (error) {
      await this.complete(error as Error);
    }
  }
  sendNext() {
    const activeConnections = Object.keys(this.activeConnections).length;
    if (activeConnections >= this.threadsQuantity) {
      return;
    }
    if (!this.parts.length) {
      if (!activeConnections) {
        this.complete();
      }
    }

    const part = this.parts.pop();
    if (this.file && part) {
      const sentSize = (part.PartNumber - 1) * this.chunkSize;
      const chunk = this.file.slice(
        sentSize,
        sentSize + this.chunkSize
      ) as File;

      const sentChunkStarted = () => {
        this.sendNext();
      };

      this.sendChunk(chunk, part, sentChunkStarted)
        .then(() => {
          this.sendNext();
        })
        .catch((error: Error) => {
          this.parts.push(part);
          this.complete(error);
        });
    }
  }
  sendChunk(chunk: File, part: FilePart, sendChunkStarted: any) {
    return new Promise((resolve, reject) => {
      this.upload(chunk, part, sendChunkStarted)
        .then((status) => {
          if (status !== 200) {
            reject(new Error(`Failed chunk upload part ${part.PartNumber}`));
            return;
          }

          resolve(status);
        })
        .catch((error: Error) => {
          reject(error);
        });
    });
  }
  upload(file: File, part: FilePart, sentChunkStarted: () => void) {
    // upload each part with its pre sign url
    return new Promise((resolve, reject) => {
      if (this.fileId && this.fileKey) {
        const partNumberIndex = part.PartNumber - 1;
        this.activeConnections[partNumberIndex] = new XMLHttpRequest();
        const xhr: XMLHttpRequest = this.activeConnections[partNumberIndex];
        sentChunkStarted();

        const processListener = this.handleUploadProgress.bind(
          this,
          part.PartNumber - 1
        );
        xhr.upload.addEventListener("progress", processListener);
        xhr.addEventListener("error", processListener);
        xhr.addEventListener("abort", processListener);
        xhr.addEventListener("loadend", processListener);

        xhr.open("PUT", part.signedUrl);
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const Etag = xhr.getResponseHeader("ETag");
            if (Etag) {
              const uploadedParts = {
                PartNumber: part.PartNumber,
                ETag: Etag.replaceAll('"', ""),
              } as FilePart;
              this.uploadedParts.push(uploadedParts);
              resolve(xhr.status);
              delete this.activeConnections[part.PartNumber - 1];
            }
          }
        };
        xhr.onerror = (error) => {
          reject(error);
          delete this.activeConnections[part.PartNumber - 1];
        };
        xhr.onabort = (error) => {
          reject(error);
          delete this.activeConnections[part.PartNumber - 1];
        };
        xhr.send(file);
      }
    });
  }

  handleUploadProgress(part: number, event: ProgressEvent) {
    if (this.file) {
      if (["progress", "error", "abort"].includes(event.type)) {
        this.progressCache[part] = event.loaded;
      }
    }

    if (event.type === "uploaded") {
      this.uploadedSize += this.progressCache[part] || 0;
      delete this.progressCache[part];
    }

    const inProgress = Object.keys(this.progressCache)
      .map(Number)
      .reduce((memo, id) => memo + this.progressCache[id], 0);
    const sent = Math.min(this.uploadedSize + inProgress, this.file?.size || 0);
    const total = this.file?.size || 0;
    const percentage = Math.round((sent / total) * 100);

    this.onProgressFn({
      sent,
      total,
      percentage,
      key: this.fileKey as string,
      uuid: this.uuid,
    });
  }
  async complete(error?: Error) {
    if (error) {
      this.onErrorFn(error);
      return;
    }

    // add a competele request here
    try {
      await this.sendCompleteRequest();
    } catch (error) {
      this.onErrorFn(error as Error);
    }

    this.onCompleteFn();
  }

  async sendCompleteRequest() {
    try {
      if (this.fileId && this.fileKey) {
        const imageFinalisationMutipartInput = {
          fileId: this.fileId,
          fileKey: this.fileKey,
          parts: this.uploadedParts,
        };

        const result = await api.post(
          endpoints.images.finaliseMultipartUpload,
          {
            json: imageFinalisationMutipartInput,
          }
        );

        return result;
      }
    } catch (error) {
      console.log(`Error in finalising multipart upload: ${error}`);
    }
  }

  onProgress(onProgress: any) {
    this.onProgressFn = onProgress;
    return this;
  }
  onError(onError: any) {
    this.onErrorFn = onError;
    return this;
  }
  onComplete(onComplete: any) {
    this.onCompleteFn = onComplete;
    return this;
  }

  abort() {
    for (const id in this.activeConnections) {
      this.activeConnections[id].abort();
    }
    this.aborted = true;
  }
}
