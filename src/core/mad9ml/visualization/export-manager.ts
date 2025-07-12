/**
 * Export Manager - Handles export functionality for visualizations
 * 
 * Provides capabilities to export visualizations in various formats
 * including images, data, and interactive formats.
 */

import { ExportOptions, ExportResult } from './types.js';

export class ExportManager {
  
  constructor() {}

  /**
   * Export visualization from canvas
   */
  public async export(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    try {
      switch (options.format) {
        case 'png':
          return await this.exportPNG(canvas, options);
        case 'svg':
          return await this.exportSVG(canvas, options);
        case 'pdf':
          return await this.exportPDF(canvas, options);
        case 'json':
          return await this.exportJSON(canvas, options);
        case 'csv':
          return await this.exportCSV(canvas, options);
        case 'html':
          return await this.exportHTML(canvas, options);
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      return {
        success: false,
        data: '',
        mimeType: 'text/plain',
        filename: 'error.txt',
        size: 0,
        metadata: { error: (error as Error).message }
      };
    }
  }

  /**
   * Export as PNG image
   */
  private async exportPNG(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    let targetCanvas = canvas;
    
    // Create high-resolution canvas if needed
    if (options.resolution) {
      targetCanvas = this.createHighResCanvas(canvas, options.resolution, options.quality || 1);
    }
    
    const dataURL = targetCanvas.toDataURL('image/png', options.quality || 1);
    const blob = this.dataURLToBlob(dataURL);
    
    return {
      success: true,
      data: dataURL,
      mimeType: 'image/png',
      filename: this.generateFilename('visualization', 'png'),
      size: blob.size,
      metadata: {
        width: targetCanvas.width,
        height: targetCanvas.height,
        quality: options.quality || 1,
        compression: options.compression || false
      }
    };
  }

  /**
   * Export as SVG (simplified implementation)
   */
  private async exportSVG(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    // For a full SVG export, we would need to recreate the visualization using SVG elements
    // This is a simplified version that converts the canvas to SVG
    
    const svgContent = this.canvasToSVG(canvas, options);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    
    return {
      success: true,
      data: svgContent,
      mimeType: 'image/svg+xml',
      filename: this.generateFilename('visualization', 'svg'),
      size: blob.size,
      metadata: {
        vectorized: options.vectorize || false,
        includeData: options.includeData || false
      }
    };
  }

  /**
   * Export as PDF (requires additional libraries in real implementation)
   */
  private async exportPDF(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    // In a real implementation, you would use a library like jsPDF
    // For now, we'll create a simple PDF-like structure
    
    const pdfContent = this.createSimplePDF(canvas, options);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    return {
      success: true,
      data: pdfContent,
      mimeType: 'application/pdf',
      filename: this.generateFilename('visualization', 'pdf'),
      size: blob.size,
      metadata: {
        embedFonts: options.embedFonts || false,
        includeMetadata: options.includeMetadata || false
      }
    };
  }

  /**
   * Export visualization data as JSON
   */
  private async exportJSON(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    const visualizationData = {
      timestamp: new Date().toISOString(),
      canvas: {
        width: canvas.width,
        height: canvas.height
      },
      metadata: {
        exportOptions: options,
        generator: 'MAD9ML Visualization Dashboard',
        version: '1.0.0'
      }
    };
    
    if (options.includeData) {
      // Add the actual visualization data
      visualizationData['data'] = this.extractVisualizationData(canvas);
    }
    
    const jsonString = JSON.stringify(visualizationData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    return {
      success: true,
      data: jsonString,
      mimeType: 'application/json',
      filename: this.generateFilename('visualization', 'json'),
      size: blob.size,
      metadata: {
        includeData: options.includeData || false,
        compression: options.compression || false
      }
    };
  }

  /**
   * Export data as CSV
   */
  private async exportCSV(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    const csvData = this.generateCSVData(canvas, options);
    const csvContent = this.arrayToCSV(csvData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    return {
      success: true,
      data: csvContent,
      mimeType: 'text/csv',
      filename: this.generateFilename('visualization_data', 'csv'),
      size: blob.size,
      metadata: {
        rows: csvData.length,
        columns: csvData[0]?.length || 0
      }
    };
  }

  /**
   * Export as interactive HTML
   */
  private async exportHTML(canvas: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    const htmlContent = this.generateInteractiveHTML(canvas, options);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    return {
      success: true,
      data: htmlContent,
      mimeType: 'text/html',
      filename: this.generateFilename('visualization', 'html'),
      size: blob.size,
      metadata: {
        interactive: true,
        includeData: options.includeData || false,
        standalone: true
      }
    };
  }

  // ========== Helper Methods ==========

  /**
   * Create high-resolution canvas
   */
  private createHighResCanvas(sourceCanvas: HTMLCanvasElement, resolution: { width: number, height: number }, quality: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Scale and draw the source canvas
    ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, canvas.width, canvas.height);
    
    return canvas;
  }

  /**
   * Convert data URL to blob
   */
  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Convert canvas to SVG (simplified)
   */
  private canvasToSVG(canvas: HTMLCanvasElement, options: ExportOptions): string {
    const dataURL = canvas.toDataURL('image/png');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>MAD9ML Visualization Export</title>
  <desc>Exported from MAD9ML Visualization Dashboard</desc>
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${dataURL}"/>
  ${options.includeMetadata ? `
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description>
        <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">MAD9ML Visualization</dc:title>
        <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">MAD9ML Visualization Dashboard</dc:creator>
        <dc:date xmlns:dc="http://purl.org/dc/elements/1.1/">${new Date().toISOString()}</dc:date>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  ` : ''}
</svg>`;
  }

  /**
   * Create simple PDF content (placeholder)
   */
  private createSimplePDF(canvas: HTMLCanvasElement, options: ExportOptions): string {
    // This is a placeholder. In a real implementation, you would use jsPDF or similar
    const dataURL = canvas.toDataURL('image/png');
    
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${canvas.width} ${canvas.height}]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
q
${canvas.width} 0 0 ${canvas.height} 0 0 cm
/Im1 Do
Q
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
279
%%EOF`;
  }

  /**
   * Extract visualization data from canvas context
   */
  private extractVisualizationData(canvas: HTMLCanvasElement): any {
    // In a real implementation, this would extract the actual data used to create the visualization
    // For now, we'll extract basic canvas information
    
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    return {
      width: canvas.width,
      height: canvas.height,
      pixelData: {
        length: imageData.data.length,
        summary: {
          totalPixels: canvas.width * canvas.height,
          averageRed: this.calculateChannelAverage(imageData.data, 0),
          averageGreen: this.calculateChannelAverage(imageData.data, 1),
          averageBlue: this.calculateChannelAverage(imageData.data, 2),
          averageAlpha: this.calculateChannelAverage(imageData.data, 3)
        }
      }
    };
  }

  /**
   * Calculate average value for a color channel
   */
  private calculateChannelAverage(data: Uint8ClampedArray, channel: number): number {
    let sum = 0;
    let count = 0;
    
    for (let i = channel; i < data.length; i += 4) {
      sum += data[i];
      count++;
    }
    
    return count > 0 ? sum / count : 0;
  }

  /**
   * Generate CSV data from visualization
   */
  private generateCSVData(canvas: HTMLCanvasElement, options: ExportOptions): any[][] {
    // Generate sample data for CSV export
    const data = [
      ['Timestamp', 'Component', 'Value', 'Status'],
      [new Date().toISOString(), 'Memory System', '85%', 'Healthy'],
      [new Date().toISOString(), 'Task Execution', '92%', 'Healthy'],
      [new Date().toISOString(), 'AI Activity', '78%', 'Warning'],
      [new Date().toISOString(), 'Autonomy Status', '95%', 'Healthy']
    ];
    
    if (options.includeMetadata) {
      data.push(['Meta', 'Canvas Width', canvas.width.toString(), 'Info']);
      data.push(['Meta', 'Canvas Height', canvas.height.toString(), 'Info']);
      data.push(['Meta', 'Export Time', new Date().toISOString(), 'Info']);
    }
    
    return data;
  }

  /**
   * Convert array to CSV string
   */
  private arrayToCSV(data: any[][]): string {
    return data.map(row => 
      row.map(cell => {
        const stringified = String(cell);
        return stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') 
          ? `"${stringified.replace(/"/g, '""')}"` 
          : stringified;
      }).join(',')
    ).join('\n');
  }

  /**
   * Generate interactive HTML with embedded visualization
   */
  private generateInteractiveHTML(canvas: HTMLCanvasElement, options: ExportOptions): string {
    const dataURL = canvas.toDataURL('image/png');
    const timestamp = new Date().toLocaleString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAD9ML Visualization Export</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1a1a1a;
            color: #ffffff;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .visualization-container {
            text-align: center;
            margin: 20px 0;
        }
        .visualization-image {
            max-width: 100%;
            height: auto;
            border: 1px solid #444;
            border-radius: 8px;
        }
        .metadata {
            background: #2d2d2d;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            font-family: monospace;
        }
        .metadata h3 {
            margin-top: 0;
        }
        .metadata pre {
            background: #1a1a1a;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        .controls {
            text-align: center;
            margin: 20px 0;
        }
        .btn {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 0 5px;
        }
        .btn:hover {
            background: #005a9c;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MAD9ML Visualization Export</h1>
        <p>Generated on ${timestamp}</p>
    </div>
    
    <div class="visualization-container">
        <img src="${dataURL}" alt="MAD9ML Visualization" class="visualization-image" id="visualization-image">
    </div>
    
    <div class="controls">
        <button class="btn" onclick="downloadImage()">Download Image</button>
        <button class="btn" onclick="toggleFullscreen()">Toggle Fullscreen</button>
        <button class="btn" onclick="showMetadata()">Show Metadata</button>
    </div>
    
    ${options.includeMetadata ? `
    <div class="metadata" id="metadata" style="display: none;">
        <h3>Export Metadata</h3>
        <pre>${JSON.stringify({
          exportTime: timestamp,
          canvasSize: { width: canvas.width, height: canvas.height },
          exportOptions: options,
          generator: 'MAD9ML Visualization Dashboard'
        }, null, 2)}</pre>
    </div>
    ` : ''}
    
    <script>
        function downloadImage() {
            const link = document.createElement('a');
            link.download = '${this.generateFilename('visualization', 'png')}';
            link.href = '${dataURL}';
            link.click();
        }
        
        function toggleFullscreen() {
            const img = document.getElementById('visualization-image');
            if (img.style.position === 'fixed') {
                img.style.position = '';
                img.style.top = '';
                img.style.left = '';
                img.style.width = '';
                img.style.height = '';
                img.style.zIndex = '';
                img.style.background = '';
            } else {
                img.style.position = 'fixed';
                img.style.top = '0';
                img.style.left = '0';
                img.style.width = '100vw';
                img.style.height = '100vh';
                img.style.zIndex = '9999';
                img.style.background = '#000';
                img.style.objectFit = 'contain';
            }
        }
        
        function showMetadata() {
            const metadata = document.getElementById('metadata');
            if (metadata) {
                metadata.style.display = metadata.style.display === 'none' ? 'block' : 'none';
            }
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const img = document.getElementById('visualization-image');
                if (img.style.position === 'fixed') {
                    toggleFullscreen();
                }
            }
        });
    </script>
</body>
</html>`;
  }

  /**
   * Generate filename with timestamp
   */
  private generateFilename(base: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${base}_${timestamp}.${extension}`;
  }

  /**
   * Get supported export formats
   */
  public getSupportedFormats(): string[] {
    return ['png', 'svg', 'pdf', 'json', 'csv', 'html'];
  }

  /**
   * Get format-specific options
   */
  public getFormatOptions(format: string): any {
    const commonOptions = {
      quality: { type: 'number', min: 0.1, max: 1, default: 1, description: 'Export quality' },
      includeData: { type: 'boolean', default: false, description: 'Include visualization data' },
      includeMetadata: { type: 'boolean', default: true, description: 'Include metadata' },
      compression: { type: 'boolean', default: false, description: 'Enable compression' }
    };
    
    const formatSpecific = {
      png: {
        resolution: { type: 'object', description: 'Target resolution { width, height }' }
      },
      svg: {
        vectorize: { type: 'boolean', default: false, description: 'Vectorize elements' },
        embedFonts: { type: 'boolean', default: false, description: 'Embed fonts' }
      },
      pdf: {
        embedFonts: { type: 'boolean', default: false, description: 'Embed fonts' }
      },
      html: {
        interactive: { type: 'boolean', default: true, description: 'Include interactive features' }
      }
    };
    
    return {
      ...commonOptions,
      ...(formatSpecific[format] || {})
    };
  }
}