import { useState, useEffect } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import * as DOCX from 'docx'; // npm install docx file-saver
import { saveAs } from 'file-saver';

export default function MCQGenerator({ darkMode }: { darkMode: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mcqText, setMcqText] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMcqText(null);
    }
  };

  const generateMCQs = async () => {
    if (!file) return;

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress increment
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 400);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('num_questions', numQuestions.toString());

    try {
      const response = await fetch('https://seifataa-mcq-generator.hf.space/generate_mcqs', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
        },
        body: formData,
      });

      const data = await response.json();
      setMcqText(data.mcqs || '⚠️ No MCQs generated.');
      setProgress(100);
    } catch (error) {
      console.error('MCQ generation error:', error);
      setMcqText('Please try generating again');
      setProgress(100);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMCQs = async () => {
    if (!mcqText) return;

    const doc = new DOCX.Document({
      sections: [
        {
          properties: {},
          children: [
            new DOCX.Paragraph({ text: 'Generated MCQs', heading: DOCX.HeadingLevel.HEADING1 }),
            ...mcqText.split('\n').map(line => new DOCX.Paragraph({ text: line }))
          ]
        }
      ]
    });

    const blob = await DOCX.Packer.toBlob(doc);
    saveAs(blob, `MCQs_${Date.now()}.docx`);
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 transition-colors ${darkMode ? 'bg-[#161B22]' : 'bg-white'}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          
          {!file ? (
            <div className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 hover:border-[#8A2BE2] ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-60 mb-6">Upload your lecture notes</p>
              <label className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#8A2BE2] to-[#FF6B6B] text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#8A2BE2]/20">
                <Upload className="w-5 h-5" />
                <span className="font-medium">Choose File</span>
                <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" className="hidden"/>
              </label>
            </div>
          ) : (
            <>
              {/* File info */}
              <div className={`rounded-lg p-4 border ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-[#8A2BE2]" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs opacity-60">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-[#FF6B6B] hover:underline text-sm">Remove</button>
                </div>
              </div>

              {/* Number of questions */}
              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions: {numQuestions}</label>
                <input type="range" min="5" max="50" step="5" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#8A2BE2]" />
                <div className="flex justify-between text-xs opacity-60 mt-1"><span>5</span><span>50</span></div>
              </div>

              {/* Generate button */}
              <div className="flex space-x-3 mt-4">
                <button onClick={generateMCQs} disabled={isGenerating} className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#8A2BE2] to-[#FF6B6B] text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#8A2BE2]/20 disabled:opacity-50">
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      {/* Bouncing-dot animation */}
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-400"></span>
                      </div>
                      <span>Generating... {progress}%</span>
                    </div>
                  ) : (
                    <span>Generate MCQs</span>
                  )}
                </button>
                {mcqText && (
                  <button onClick={downloadMCQs} className="flex items-center space-x-2 px-6 py-3 bg-[#00FFC6] text-gray-900 rounded-lg hover:scale-105 hover:shadow-lg hover:shadow-[#00FFC6]/20">
                    <Download className="w-5 h-5" /><span>Download</span>
                  </button>
                )}
              </div>

              {/* Status / Preview */}
              {mcqText && <div className={`rounded-lg p-4 border-l-4 border-[#00FFC6] ${darkMode ? 'bg-[#00FFC6]/10' : 'bg-[#00FFC6]/5'}`}>
                <p className="text-sm">✓ Your MCQs are ready! Click download to save them as Word.</p>
              </div>}

            </>
          )}
        </div>
      </div>
    </div>
  );
}
