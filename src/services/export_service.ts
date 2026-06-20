export class ExportService {
  async exportToCSV(filename: string, content: string): Promise<boolean> {
    try {
      const encodedUri = encodeURI(content);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error("CSV Export failed", error);
      return false;
    }
  }

  async exportToPDF(): Promise<boolean> {
    try {
      // Typically we'd use a PDF library here, but printing is the current implementation
      window.print();
      return true;
    } catch (error) {
      console.error("PDF Export failed", error);
      return false;
    }
  }
}

export const exportService = new ExportService();
