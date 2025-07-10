import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import trialService from "../../../services/trial.service";
import Helpers from "../../../config/helpers";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { File, FileText } from "lucide-react";

interface FileUploadData {
  plaintiffFiles: FileList | null;
  defendantFiles: FileList | null;
}

const TrialAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trialId, setTrialId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | undefined>(undefined);
  const [fileData, setFileData] = useState<FileUploadData>({
    plaintiffFiles: null,
    defendantFiles: null,
  });

  useEffect(() => {
    // Extract trial ID from URL query params
    const params = new URLSearchParams(location.search);
    const id = params.get('trialId');
    if (id) {
      setTrialId(id);
    } else {
      Helpers.showToast("Trial ID not found. Please submit a mock trial first.", "error");
      navigate('/user/trial');
    }
  }, [location, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'plaintiffFiles' | 'defendantFiles') => {
    setFileData(prev => ({ ...prev, [type]: e.target.files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialId) {
      Helpers.showToast("Trial ID is missing", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('trialId', trialId);
      
      // Append plaintiff files
      if (fileData.plaintiffFiles) {
        for (let i = 0; i < fileData.plaintiffFiles.length; i++) {
          formData.append('plaintiffFiles', fileData.plaintiffFiles[i]);
        }
      }
      
      // Append defendant files
      if (fileData.defendantFiles) {
        for (let i = 0; i < fileData.defendantFiles.length; i++) {
          formData.append('defendantFiles', fileData.defendantFiles[i]);
        }
      }

      const response = await trialService.analyzeTrialFiles(formData);
      if (response.success) {
        setAnalysis(response.analysis);
        Helpers.showToast("Files analyzed successfully", "success");
      }
    } catch (error) {
      console.error("Error analyzing trial:", error);
      Helpers.showToast("Failed to analyze trial files. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportAsPDF = () => {
    if (!analysis) return;
    
    try {
      setLoading(true);
      
      // Create a hidden iframe with the content styled for PDF
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.top = '-9999px';
      printIframe.style.left = '-9999px';
      document.body.appendChild(printIframe);
      
      const contentDocument = printIframe.contentDocument;
      if (contentDocument) {
        contentDocument.open();
        contentDocument.write(`
          <html>
            <head>
              <title>Trial Analysis Report</title>
              <style>
                @page {
                  size: A4;
                  margin: 20mm;
                }
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .header {
                  text-align: center;
                  padding-bottom: 20px;
                  border-bottom: 1px solid #eee;
                  margin-bottom: 30px;
                }
                .header h1 {
                  font-size: 24px;
                  color: #2C3E50;
                  margin-bottom: 8px;
                }
                .header p {
                  font-size: 14px;
                  color: #7F8C8D;
                }
                .content {
                  font-size: 12pt;
                }
                h1, h2, h3, h4, h5, h6 {
                  color: #2C3E50;
                  margin-top: 24px;
                  margin-bottom: 16px;
                  font-weight: 600;
                }
                h1 { font-size: 20pt; }
                h2 { font-size: 18pt; }
                h3 { font-size: 16pt; }
                h4 { font-size: 14pt; }
                h5 { font-size: 12pt; }
                pre {
                  background-color: #f8f9fa;
                  border-radius: 3px;
                  font-size: 11pt;
                  line-height: 1.45;
                  overflow: auto;
                  padding: 16px;
                  white-space: pre-wrap;
                }
                code {
                  background-color: #f8f9fa;
                  border-radius: 3px;
                  font-size: 11pt;
                  margin: 0;
                  padding: 0.2em 0.4em;
                  font-family: monospace;
                }
                blockquote {
                  border-left: 4px solid #ecf0f1;
                  color: #7F8C8D;
                  margin: 0;
                  padding: 0 0 0 16px;
                }
                ul, ol {
                  padding-left: 2em;
                }
                li {
                  margin-bottom: 8px;
                }
                table {
                  border-spacing: 0;
                  border-collapse: collapse;
                  margin: 16px 0;
                  width: 100%;
                }
                table th, table td {
                  border: 1px solid #ddd;
                  padding: 8px 12px;
                }
                table th {
                  background-color: #f8f9fa;
                }
                table tr {
                  background-color: #fff;
                  border-top: 1px solid #c6cbd1;
                }
                table tr:nth-child(2n) {
                  background-color: #f8f9fa;
                }
                .footer {
                  position: fixed;
                  bottom: 20px;
                  width: 100%;
                  text-align: center;
                  font-size: 10pt;
                  color: #95A5A6;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Trial Analysis Report</h1>
                <p>${new Date().toLocaleDateString()}</p>
              </div>
              <div class="content" id="content"></div>
              <div class="footer">
                Legal-Master AI Analysis
              </div>
            </body>
          </html>
        `);
        contentDocument.close();
        
        // Format content with styled HTML
        const formatContent = () => {
          const contentDiv = contentDocument.getElementById('content');
          if (contentDiv) {
            // Format markdown content to HTML with proper styling
            let formattedContent = analysis
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
              .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code>$1</code>')
              .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
              .replace(/\n\n/g, '<br/><br/>')
              .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
              .replace(/^([0-9]+)\. (.*$)/gm, '<ol><li>$2</li></ol>');
            
            contentDiv.innerHTML = formattedContent;
          }
        };
        
        // Wait for iframe to load
        setTimeout(() => {
          formatContent();
          
          // Print with a timeout to ensure content is rendered
          setTimeout(() => {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
            
            // Clean up
            setTimeout(() => {
              document.body.removeChild(printIframe);
              setLoading(false);
            }, 1000);
          }, 500);
        }, 500);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Helpers.showToast('Failed to generate PDF. Please try again.', 'error');
      setLoading(false);
    }
  };

  const exportAsText = () => {
    if (!analysis) return;
    
    // Create a Blob with the text content
    const blob = new Blob([analysis], { type: 'text/plain' });
    
    // Create a link element to download the file
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trial-analysis.txt';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Trial Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload files for both parties to generate an analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-border bg-card rounded-lg shadow-md p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plaintiff Files Section */}
          <div className="space-y-4 border-r-0 md:border-r border-border md:pr-4">
            <h2 className="text-lg font-semibold text-center">Plaintiff Files</h2>
            <div className="space-y-1">
              <label htmlFor="plaintiffFiles" className="block text-sm font-medium">Upload Plaintiff Documents</label>
              <input
                id="plaintiffFiles"
                type="file"
                name="plaintiffFiles"
                className="w-full p-2 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
                onChange={(e) => handleFileChange(e, 'plaintiffFiles')}
                multiple
              />
              <p className="text-xs text-muted-foreground mt-1">Upload briefs, evidence, or other documents</p>
            </div>
          </div>

          {/* Defendant Files Section */}
          <div className="space-y-4 md:pl-4">
            <h2 className="text-lg font-semibold text-center">Defendant Files</h2>
            <div className="space-y-1">
              <label htmlFor="defendantFiles" className="block text-sm font-medium">Upload Defendant Documents</label>
              <input
                id="defendantFiles"
                type="file"
                name="defendantFiles"
                className="w-full p-2 text-sm border border-input rounded-md bg-background focus:ring-1 focus:ring-[#BB8A28] focus:outline-none"
                onChange={(e) => handleFileChange(e, 'defendantFiles')}
                multiple
              />
              <p className="text-xs text-muted-foreground mt-1">Upload responses, counter-evidence, or other documents</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button 
            type="submit" 
            className="w-full md:w-auto"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Generate Analysis"}
          </Button>
        </div>
      </form>

      {analysis && (
        <div className="mt-8 border border-border bg-card rounded-lg shadow-md p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Analysis Report</h2>
            <div className="flex gap-2">
              <Button 
                onClick={exportAsText} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
              >
                <FileText size={16} />
                <span>Text</span>
              </Button>
              <Button 
                onClick={exportAsPDF} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
              >
                <File size={16} />
                <span>PDF</span>
              </Button>
            </div>
          </div>
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <ReactMarkdown>
              {analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialAnalysis; 