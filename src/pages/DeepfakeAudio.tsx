import { useState, useRef, useEffect } from 'react';
import Button from '../components/Button';
import { Mic, Download, PlayArrow, Pause } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DeepfakeAudioPage = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate audio using Web Speech API
  const handleGenerateAudio = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    
    try {
      // Cancel any previous speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      utterance.rate = 1;
      utterance.pitch = 1;
      
      // Get available voices and use default
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices.find(v => v.default) || voices[0];
      }
      
      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        startProgressTimer();
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        stopProgressTimer();
      };
      
      utterance.onpause = () => {
        setIsPlaying(false);
        stopProgressTimer();
      };
      
      utterance.onresume = () => {
        setIsPlaying(true);
        startProgressTimer();
      };
      
      // Play the audio
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startProgressTimer = () => {
    stopProgressTimer();
    const duration = text.length / 12; // Approximate duration in seconds
    const increment = 100 / (duration * 10);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current as NodeJS.Timeout);
          return 100;
        }
        return prev + increment;
      });
    }, 100);
  };

  const stopProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
    } else {
      window.speechSynthesis.resume();
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    stopProgressTimer();
  };

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis.getVoices().length > 0) {
        return;
      }
      window.speechSynthesis.onvoiceschanged = loadVoices;
    };
    
    loadVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      stopProgressTimer();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
      {/* Header Section */}
      <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-12 text-center"
  >
    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Audio Generator</h1>
    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
      Convert text to high-quality speech instantly
    </p>
  </motion.div>


      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Text Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Text Input</h2>
          <textarea
            className="w-full h-72 p-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Enter the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div className="mt-6">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateAudio}
              loading={isLoading}
              disabled={isLoading || !text.trim()}
              icon={Mic}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Audio'}
            </Button>
          </div>
        </motion.div>

        {/* Audio Output Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 h-fit"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Audio Controls</h2>
          
          <div className="space-y-6">
            {/* Audio Player */}
            <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={togglePlayPause}
                    disabled={!text.trim()}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                      text.trim() 
                        ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isPlaying ? <Pause className="text-xl" /> : <PlayArrow className="text-xl" />}
                  </button>
                  
                  <button
                    onClick={handleStop}
                    disabled={!isPlaying}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="ml-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {text.trim() ? 'Ready to play' : 'No audio'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {text.length > 0 ? Math.ceil(text.length / 12) : 0}s duration
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>0:00</span>
                  <span>{text.length > 0 ? Math.ceil(text.length / 12) : 0}:00</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Audio Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Characters</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{text.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Words</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.ceil(text.length / 5)}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-8"
      >
        <p>This service uses your browser's built-in text-to-speech capabilities</p>
      </motion.div>
    </div>
  );
};

export default DeepfakeAudioPage;