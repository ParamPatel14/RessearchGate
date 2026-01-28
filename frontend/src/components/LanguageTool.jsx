import React, { useState } from 'react';
import { refineText, translateText } from '../api';

const LanguageTool = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState('refine'); // refine | translate
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!text) return;
    setLoading(true);
    try {
        let res;
        if (mode === 'refine') {
            res = await refineText(text);
            setResult(res.refined_text);
        } else {
            res = await translateText(text, targetLang);
            setResult(res.translated_text);
        }
    } catch (err) {
        console.error(err);
        setResult("Error processing text.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-bold mb-4">Academic Language Assistant</h3>
        
        <div className="mb-4">
            <textarea
                className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500"
                rows="4"
                placeholder="Enter your academic text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
        </div>

        <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
                <input 
                    type="radio" 
                    id="refine" 
                    name="mode" 
                    checked={mode === 'refine'} 
                    onChange={() => setMode('refine')}
                />
                <label htmlFor="refine">Refine Tone</label>
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="radio" 
                    id="translate" 
                    name="mode" 
                    checked={mode === 'translate'} 
                    onChange={() => setMode('translate')}
                />
                <label htmlFor="translate">Translate</label>
            </div>
            
            {mode === 'translate' && (
                <select 
                    value={targetLang} 
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="border rounded px-2 py-1"
                >
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                </select>
            )}
        </div>

        <button
            onClick={handleAction}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
            {loading ? 'Processing...' : (mode === 'refine' ? 'Refine Text' : 'Translate')}
        </button>

        {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Result:</h4>
                <p className="text-gray-800">{result}</p>
            </div>
        )}
    </div>
  );
};

export default LanguageTool;
