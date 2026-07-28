// frontend/src/utils/fileUtils.ts

/**
 * Saves a Blob to a file using the File System Access API (if available),
 * otherwise falls back to a traditional download via anchor tag.
 * Returns an object with success flag and the actual file name (if available).
 * Throws an error for any failure other than user cancellation.
 */
export const saveFileWithPicker = async (
  blob: Blob,
  suggestedName: string,
  mimeType: string
): Promise<{ success: boolean; fileName?: string }> => {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: [
          {
            description:
              mimeType === 'application/json'
                ? 'JSON file'
                : mimeType === 'text/csv'
                ? 'CSV file'
                : 'Image file',
            accept: {
              [mimeType]: [
                '.' +
                  (mimeType === 'application/json'
                    ? 'json'
                    : mimeType === 'text/csv'
                    ? 'csv'
                    : 'png'),
              ],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      // Get the actual file name from the handle
      const fileName = handle.name || suggestedName;
      return { success: true, fileName };
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('abort')) {
        return { success: false };
      }
      throw err;
    }
  }

  // Fallback: create a link and trigger a download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
  return { success: true, fileName: suggestedName };
};