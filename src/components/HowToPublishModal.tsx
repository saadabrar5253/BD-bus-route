import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Terminal, 
  FolderGit2, 
  Sparkles,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react';

interface HowToPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPublishModal: React.FC<HowToPublishModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'netlify'>('github');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>100% Free Global Access Guide</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How to Publish on GitHub & Go Live
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Step-by-step instructions with terminal commands to publish this repository and host it for free.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'github'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderGit2 className="w-4 h-4 text-emerald-700" />
            <span>GitHub & GitHub Pages (Full Tutorial)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('netlify')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'netlify'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Netlify (Drag & Drop in 5 Seconds)</span>
          </button>
        </div>

        {/* TAB 1: GITHUB INSTRUCTIONS */}
        {activeTab === 'github' && (
          <div className="space-y-6 text-slate-700 text-xs sm:text-sm">
            
            {/* Step 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">1</span>
                <span>Create a New Repository on GitHub</span>
              </div>
              <p className="text-xs text-slate-600">
                1. Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline">github.com/new</a> in your browser.
              </p>
              <p className="text-xs text-slate-600">
                2. Enter repository name: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-900 border border-slate-200">bangladesh-bus-route</code>
              </p>
              <p className="text-xs text-slate-600">
                3. Set visibility to <strong>Public</strong> (required for free GitHub Pages hosting).
              </p>
              <p className="text-xs text-slate-600">
                4. <strong>Important:</strong> Leave "Add a README", ".gitignore", and "license" <u>UNCHECKED</u> (our project already has them).
              </p>
              <p className="text-xs text-slate-600">
                5. Click the green <strong>Create repository</strong> button.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">2</span>
                <span>Run These Git Commands in Your Terminal</span>
              </div>
              <p className="text-xs text-slate-600">
                Open your terminal inside the project root folder and run each command:
              </p>

              {/* Command 1 */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Initialize Git:</span>
                <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                  <span>git init</span>
                  <button
                    onClick={() => handleCopy('git init', 'g1')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 'g1' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'g1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Command 2 */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Add all files & commit:</span>
                <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                  <span>git add . && git commit -m "Initial release of Bangladesh Bus Route"</span>
                  <button
                    onClick={() => handleCopy('git add . && git commit -m "Initial release of Bangladesh Bus Route"', 'g2')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 'g2' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'g2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Command 3 */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Set branch to main:</span>
                <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                  <span>git branch -M main</span>
                  <button
                    onClick={() => handleCopy('git branch -M main', 'g3')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 'g3' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'g3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Command 4 */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Connect to your GitHub repo (Replace YOUR_USERNAME):</span>
                <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                  <span>git remote add origin https://github.com/YOUR_USERNAME/bangladesh-bus-route.git</span>
                  <button
                    onClick={() => handleCopy('git remote add origin https://github.com/YOUR_USERNAME/bangladesh-bus-route.git', 'g4')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 'g4' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'g4' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Command 5 */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">Push to GitHub:</span>
                <div className="mt-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs">
                  <span>git push -u origin main</span>
                  <button
                    onClick={() => handleCopy('git push -u origin main', 'g5')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedStep === 'g5' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'g5' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">3</span>
                <span>Enable Free GitHub Pages Hosting (1 Click)</span>
              </div>
              <p className="text-xs text-slate-700">
                1. Go to your repository page on GitHub: <code className="bg-white px-2 py-0.5 rounded font-mono text-xs border border-emerald-200">https://github.com/YOUR_USERNAME/bangladesh-bus-route</code>
              </p>
              <p className="text-xs text-slate-700">
                2. Click the <strong>Settings</strong> tab (the gear icon near top right).
              </p>
              <p className="text-xs text-slate-700">
                3. In the left menu, click <strong>Pages</strong>.
              </p>
              <p className="text-xs text-slate-700">
                4. Under <strong>Build and deployment → Source</strong>, select: <strong className="text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">GitHub Actions</strong>.
              </p>
              <div className="mt-2 p-3 rounded-xl bg-white border border-emerald-200 text-xs text-emerald-900">
                ✅ <strong>Everything is pre-configured!</strong> We already added the <code className="font-mono font-bold">.github/workflows/deploy.yml</code> and set <code className="font-mono font-bold">base: './'</code> in <code className="font-mono">vite.config.ts</code>. GitHub Actions will automatically compile and deploy your web app in 1 minute!
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs">4</span>
                <span>Your Live Public URL</span>
              </div>
              <p className="text-xs text-slate-600">
                In about 60 seconds, check the <strong>Actions</strong> tab. You will see a green checkmark, and your site is live at:
              </p>
              <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs font-bold text-center">
                https://YOUR_USERNAME.github.io/bangladesh-bus-route/
              </div>
              <p className="text-xs text-slate-500 text-center">
                Accessible by anyone, anywhere in the world on mobile, tablet, and PC!
              </p>
            </div>

          </div>
        )}

        {/* TAB 2: NETLIFY INSTRUCTIONS */}
        {activeTab === 'netlify' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">
                  Deploy to Netlify via Drag-and-Drop (Zero Git Required)
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  5 Seconds
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">1.</span>
                  <div>
                    Run <code className="bg-slate-900 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs">npm run build</code> in your terminal. This creates a <code className="font-mono font-bold">dist</code> folder.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">2.</span>
                  <div>
                    Open <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 underline">app.netlify.com/drop</a> in your browser.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">3.</span>
                  <div>
                    Drag the <code className="bg-emerald-100 text-emerald-900 font-mono px-1.5 py-0.5 rounded font-bold">dist</code> folder into the drop zone.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-800">4.</span>
                  <div>
                    Netlify gives you an instant live URL like <code className="font-mono text-slate-900 font-bold">https://bangladesh-bus-route.netlify.app</code> with free SSL and PWA support!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Full markdown guide also saved at <code className="font-mono text-slate-600">GITHUB_PUBLISH_GUIDE.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
