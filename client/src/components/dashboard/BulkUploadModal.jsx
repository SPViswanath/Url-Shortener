/**
 * BulkUploadModal.jsx
 * 
 * Component for uploading a CSV file to bulk create shortened URLs.
 * Handles drag-and-drop file selection and API submission.
 */
import { useState, useEffect } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import * as urlApi from "../../services/urlApi";

export default function BulkUploadModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFile(null);
      setResult(null);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      toast.error("Please select a valid CSV file");
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== "text/csv" && !droppedFile.name.endsWith('.csv')) {
        toast.error("Please select a valid CSV file");
        return;
      }
      setFile(droppedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await urlApi.bulkUploadUrls(formData);
      setResult(res.data);
      toast.success(res.message || "Bulk import complete!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to process bulk upload");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--color-secondary)]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-[var(--color-secondary)]">Bulk Import URLs</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">CSV Format Requirements:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>File must be a valid <strong>.csv</strong></li>
                  <li>Required column: <strong>originalUrl</strong> (or url)</li>
                  <li>Optional column: <strong>title</strong></li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Upload CSV File</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl transition-all ${isDragging ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-gray-300 hover:bg-gray-50"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[var(--color-primary)] hover:text-[#c5654c] focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      CSV up to 10MB
                    </p>
                  </div>
                </div>
                {file && (
                  <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-xl mt-3">
                    <FileText className="w-5 h-5 text-[var(--color-primary)] mr-3" />
                    <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                    <button type="button" onClick={() => setFile(null)} className="ml-auto text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:bg-[#c5654c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md shadow-[#e07a5f]/20"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Upload & Process"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Import Successful!</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                Your CSV file has been processed and your links are ready to use.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-2xl font-bold text-gray-900">{result.totalProcessed}</div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">Total Rows</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide mt-1">Created</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="text-2xl font-bold text-orange-500">{result.skipCount}</div>
                  <div className="text-xs font-medium text-orange-500 uppercase tracking-wide mt-1">Skipped</div>
                </div>
              </div>
              
              {result.skipCount > 0 && (
                <div className="flex items-start p-3 bg-orange-50 text-orange-800 text-sm rounded-xl mb-6 text-left">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Some rows were skipped. This usually happens if the URL was invalid or you've already shortened that exact destination link.</p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full btn-primary py-3"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
