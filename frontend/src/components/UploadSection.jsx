import { useState, useRef } from 'react';

export default function UploadSection({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingKaggle, setLoadingKaggle] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.pdf')) {
      setError('PDF files contain unstructured text. FairLens requires structured CSV data for bias auditing. Please convert your data to CSV.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a structured dataset in CSV format.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { uploadDataset } = await import('../api.js');
      const result = await uploadDataset(file);
      onUploadSuccess(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadKaggle = async () => {
    setError(null);
    setLoadingKaggle(true);
    try {
      const { loadKaggleDataset } = await import('../api.js');
      const result = await loadKaggleDataset('adult-income');
      // Pass the result with kaggle metadata so App can auto-configure
      onUploadSuccess({
        session_id: result.session_id,
        dataset_info: result.dataset_info,
        kaggle_meta: result.kaggle_meta,
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load Kaggle dataset. Please try again.');
    } finally {
      setLoadingKaggle(false);
    }
  };

  const isLoading = uploading || loadingKaggle;

  return (
    <div className="animate-fade-in-up">
      <div
        className={`dropzone p-12 text-center ${dragging ? 'active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => !isLoading && fileRef.current?.click()}
        id="upload-dropzone"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          id="file-input"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            <p className="text-primary-300 font-medium">Analyzing your dataset...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-200">Drop your CSV dataset here</p>
              <p className="text-sm text-slate-400 mt-1">or click to browse • CSV files only</p>
            </div>
          </div>
        )}
      </div>

      {/* Kaggle Dataset Section */}
      <div className="mt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-slate-700/50" />
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">or use a sample dataset</span>
          <div className="flex-1 h-px bg-slate-700/50" />
        </div>

        <button
          onClick={handleLoadKaggle}
          disabled={isLoading}
          className="w-full kaggle-dataset-card group"
          id="load-kaggle-btn"
        >
          {loadingKaggle ? (
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-cyan-300 font-medium">Downloading from Kaggle...</span>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {/* Kaggle Logo */}
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.281.18.046.095.015.186-.09.27l-7.072 6.893 7.557 8.104c.105.089.127.186.075.281z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    Adult Income Dataset
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 font-semibold">
                    KAGGLE
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  32,561 rows • 15 columns — Predict income &gt;$50K based on census data.
                  Includes age, workclass, education, race, sex, and more.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 border border-slate-600/30">race</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 border border-slate-600/30">gender</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 border border-slate-600/30">income</span>
                  <span className="text-[10px] text-slate-500">← suggested attributes</span>
                </div>
              </div>
              <div className="shrink-0 self-center">
                <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm" id="upload-error">
          {error}
        </div>
      )}
    </div>
  );
}
