import { useState } from 'react';
import { Mic, Upload, FileAudio } from 'lucide-react';

function App() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎙️ Speech to Text
          </h1>
          <p className="text-xl text-gray-300">Convert your voice into text instantly</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Record Audio Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:border-purple-500 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Mic className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Record Voice</h3>
              <p className="text-gray-400 mb-6">Speak directly and get instant transcription</p>
              
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-full py-4 px-8 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3
                  ${isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
              </button>
            </div>
          </div>

          {/* Upload Audio Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:border-purple-500 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Upload className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Upload Audio</h3>
              <p className="text-gray-400 mb-6">Upload .mp3, .wav, or .m4a files</p>
              
              <label className="w-full py-4 px-8 bg-white/10 hover:bg-white/20 border border-dashed border-white/30 rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-3">
                <FileAudio className="w-6 h-6" />
                Choose Audio File
                <input type="file" className="hidden" accept="audio/*" />
              </label>
            </div>
          </div>
        </div>

        <div className="text-center mt-10 text-gray-500 text-sm">
          Day 1 Complete • Built with React + Tailwind CSS
        </div>
      </div>
    </div>
  );
}

export default App;