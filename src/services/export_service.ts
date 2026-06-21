export class ExportService {
  private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delayMs = 1000): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Export attempt ${i + 1} failed. Retrying...`, error);
        if (i < maxRetries - 1) {
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
    }
    throw lastError;
  }

  async exportToCSV(filename: string, content: string): Promise<boolean> {
    try {
      await this.withRetry(async () => {
        const encodedUri = encodeURI(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      return true;
    } catch (error) {
      console.error("CSV Export failed after retries", error);
      return false;
    }
  }

  async exportToPDF(): Promise<boolean> {
    try {
      await this.withRetry(async () => {
        // Typically we'd use a PDF library here, but printing is the current implementation
        window.print();
      });
      return true;
    } catch (error) {
      console.error("PDF Export failed after retries", error);
      return false;
    }
  }
}

export const exportService = new ExportService();
