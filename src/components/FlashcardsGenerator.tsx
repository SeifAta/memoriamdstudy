import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import './Flashcards.css';

interface Flashcard {
  front: string;
  back: string;
}

export default function FlashcardsGenerator({ darkMode }: { darkMode: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFlashcards([]);
    }
  };

  const generateFlashcards = async () => {
    if (!file) return;
    setIsGenerating(true);
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://seifataa-Flashcards.hf.space/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const cards: Flashcard[] = data.data || [];

      if (cards.length === 0) {
        setFlashcards([{ front: '⚠️ No flashcards generated', back: 'Try uploading a more detailed file.' }]);
      } else {
        setFlashcards(cards);
      }
    } catch (error) {
      console.error('Flashcard generation error:', error);
      setFlashcards([{ front: '⚠️ Error generating flashcards', back: String(error) }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

const exportFlashcardsPDF = () => {
  if (!flashcards.length) return;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20; // page margin
  const boxPadding = 10; // padding inside the rectangle
  const boxRadius = 8; // rounded corners
  const lineHeight = 8; // space between lines

  flashcards.forEach((card, index) => {
    // Function to draw a centered gradient rectangle
    const drawBox = () => {
      const gradientColor = '#1E3A8A'; // dark blue
      pdf.setDrawColor(gradientColor);
      pdf.setLineWidth(0.5);
      const boxX = margin;
      const boxY = margin;
      const boxWidth = pageWidth - 2 * margin;
      const boxHeight = pageHeight - 2 * margin;
      pdf.roundedRect(boxX, boxY, boxWidth, boxHeight, boxRadius, boxRadius, 'S');
      return { boxX: boxX + boxPadding, boxY: boxY + boxPadding, boxWidth: boxWidth - 2 * boxPadding, boxHeight: boxHeight - 2 * boxPadding };
    };

    // FRONT (Question)
    const { boxX, boxY, boxWidth, boxHeight } = drawBox();
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 139); // dark blue
    pdf.setFont(undefined, "bold");
    const frontLines = pdf.splitTextToSize(card.front, boxWidth);
    let totalHeight = frontLines.length * lineHeight;
    let startY = boxY + (boxHeight - totalHeight) / 2 + lineHeight / 2;
    frontLines.forEach((line) => {
      pdf.text(line, pageWidth / 2, startY, { align: 'center' });
      startY += lineHeight;
    });

    // BACK (Answer)
    if (index < flashcards.length) pdf.addPage();
    const { boxX: backX, boxY: backY, boxWidth: backW, boxHeight: backH } = drawBox();
    pdf.setFontSize(16);
    pdf.setTextColor(0, 100, 0); // dark green
    pdf.setFont(undefined, "bold");
    const backLines = pdf.splitTextToSize(card.back, backW);
    totalHeight = backLines.length * lineHeight;
    startY = backY + (backH - totalHeight) / 2 + lineHeight / 2;
    backLines.forEach((line) => {
      pdf.text(line, pageWidth / 2, startY, { align: 'center' });
      startY += lineHeight;
    });

    if (index < flashcards.length - 1) pdf.addPage();
  });

  pdf.save(`flashcards_${Date.now()}.pdf`);
};


  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 transition-colors ${darkMode ? 'bg-[#161B22]' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Flashcards Generator</h2>
            <p className="text-sm opacity-60">Create interactive study flashcards from your notes</p>
          </div>

          {!file ? (
            <div className={`rounded-2xl border-2 border-dashed p-12 text-center ${darkMode ? 'border-gray-800' : 'border-gray-300'}`}>
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm opacity-60 mb-6">Upload your study materials</p>
              <label className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] text-white rounded-lg cursor-pointer">
                <Upload className="w-5 h-5" />
                <span className="font-medium">Select File</span>
                <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`rounded-lg p-4 border ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{file.name}</p>
                  <button onClick={() => setFile(null)} className="text-[#FF6B6B] hover:underline text-sm">Remove</button>
                </div>
              </div>

              <button
                onClick={generateFlashcards}
                disabled={isGenerating}
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-[#00FFC6] to-[#8A2BE2] text-white rounded-lg disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Flashcards...</span>
                  </>
                ) : (
                  <span className="font-medium">Generate Flashcards</span>
                )}
              </button>

              {flashcards.length > 0 && (
                <div className="space-y-6">
                  <div className="relative h-[400px] perspective-1000">
                    <div
                      className={`card-container ${isFlipped ? 'flipped' : ''}`}
                      onClick={() => setIsFlipped(!isFlipped)}
                    >
                      {/* FRONT */}
                      <div className={`card-front ${
                        darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-[#00FFC6]' : 'bg-gradient-to-br from-white to-gray-50 border-[#8A2BE2]'
                      } border-2`}>
                        <div>
                          <div className="text-xs font-medium text-[#00FFC6] mb-4">FRONT</div>
                          <p className="text-2xl font-bold">{flashcards[currentIndex].front}</p>
                          <div className="mt-8 text-sm opacity-60">Click to flip</div>
                        </div>
                      </div>

                      {/* BACK */}
                      <div className={`card-back ${
                        darkMode ? 'bg-gradient-to-br from-[#8A2BE2] to-[#00FFC6] text-white' : 'bg-gradient-to-br from-[#00FFC6] to-[#8A2BE2] text-white'
                      }`}>
                        <div>
                          <div className="text-xs font-medium mb-4">BACK</div>
                          <p className="text-lg leading-relaxed">{flashcards[currentIndex].back}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button onClick={prevCard} disabled={flashcards.length <= 1}>Previous</button>
                    <span>{currentIndex + 1} / {flashcards.length}</span>
                    <button onClick={nextCard} disabled={flashcards.length <= 1}>Next</button>
                  </div>

                  <button onClick={exportFlashcardsPDF}>Export Flashcards</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
