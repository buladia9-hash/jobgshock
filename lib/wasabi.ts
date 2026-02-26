import { uploadFile, getFileUrl, deleteFile } from './wasabi-server';

export const wasabiStorage = {
  async uploadFile(file: File, folder: string = 'resumes') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return await uploadFile(formData);
  },

  async getFileUrl(fileId: string) {
    return await getFileUrl(fileId);
  },

  async deleteFile(fileId: string) {
    return await deleteFile(fileId);
  },
};
