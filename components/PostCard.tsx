import React, { useState } from 'react';
import { AspectRatio, GeneratedPost, ImageResolution, Platform } from '../types';
import { generateSocialImage } from '../services/geminiService';
import { Copy, RefreshCw, Download, Settings2, Image as ImageIcon, Loader2, Zap } from 'lucide-react';
import SpotlightCard from './SpotlightCard';
import GradientButton from './GradientButton';
import DecryptedText from './DecryptedText';

interface PostCardProps {
  post: GeneratedPost;
  onUpdate: (updatedPost: GeneratedPost) => void;
  globalResolution: ImageResolution;
  isProMode: boolean;
}

const PlatformIcon: React.FC<{ platform: Platform }> = ({ platform }) => {
  switch (platform) {
    case 'LinkedIn':
      return <div className="text-blue-400 font-bold tracking-tight">in</div>;
    case 'Twitter':
      return <div className="text-white font-bold text-lg">𝕏</div>;
    case 'Instagram':
      return <div className="text-fuchsia-400 font-bold tracking-tight">Ig</div>;
    default:
      return null;
  }
};

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, globalResolution, isProMode }) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [customPrompt, setCustomPrompt] = useState(post.imagePrompt);
  const [customAR, setCustomAR] = useState<AspectRatio>(post.aspectRatio);
  const [customRes, setCustomRes] = useState<ImageResolution>(globalResolution);

  const handleCopy = () => {
    const fullText = post.platform === 'Instagram' 
      ? `${post.content}\n\n${post.hashtags?.join(' ')}` 
      : post.content;
    navigator.clipboard.writeText(fullText);
  };

  const handleRegenerateImage = async () => {
    setIsRegenerating(true);
    setShowSettings(false);
    try {
      const newImageUrl = await generateSocialImage(customPrompt, customAR, customRes, isProMode);
      onUpdate({
        ...post,
        imageUrl: newImageUrl,
        imagePrompt: customPrompt,
        aspectRatio: customAR
      });
    } catch (error) {
      console.error("Failed to regenerate image", error);
      alert("Failed to regenerate image. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <SpotlightCard className="h-full flex flex-col group hover:shadow-2xl hover:shadow-fuchsia-900/10 transition-all duration-500">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black/20">
        <div className="flex items-center space-x-3">
          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800 shadow-inner">
             <PlatformIcon platform={post.platform} />
          </div>
          <span className="font-bold text-sm tracking-wide text-neutral-300 uppercase">{post.platform}</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-neutral-500 hover:text-white transition-colors p-2 rounded-md hover:bg-neutral-800"
          title="Copy Text"
        >
          <Copy size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col space-y-4">
        <div className="prose prose-invert prose-sm max-w-none text-neutral-400 whitespace-pre-wrap font-light leading-relaxed">
          <p>{post.content}</p>
          {post.hashtags && (
            <p className="text-fuchsia-500/80 text-xs mt-3 font-medium">{post.hashtags.join(' ')}</p>
          )}
        </div>
      </div>

      {/* Image Section */}
      <div className="bg-black/40 p-3 relative mt-auto border-t border-neutral-800">
        <div className="relative rounded-lg overflow-hidden bg-black w-full flex items-center justify-center min-h-[220px] border border-neutral-800/50">
          {post.imageLoading || isRegenerating ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-500 bg-black/80 z-10">
               <Loader2 className="animate-spin mb-3 text-fuchsia-500" size={24} />
               <DecryptedText text="RENDERING..." speed={100} className="text-[10px] tracking-widest" />
             </div>
          ) : post.imageUrl ? (
            <img 
              src={post.imageUrl} 
              alt={`Generated for ${post.platform}`} 
              className="w-full h-auto object-contain max-h-[400px] transition-transform duration-700 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-700 p-8">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-xs uppercase tracking-widest">Visual Missing</span>
            </div>
          )}

          {/* Overlay Actions */}
          {!post.imageLoading && !isRegenerating && post.imageUrl && (
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <button 
                onClick={() => setShowSettings(!showSettings)}
                className="bg-black/60 hover:bg-black text-white p-2 rounded-lg backdrop-blur-md border border-white/10 shadow-xl transition-all"
                title="Image Settings"
              >
                <Settings2 size={14} />
              </button>
              <a 
                href={post.imageUrl} 
                download={`${post.platform}-image.png`}
                className="bg-black/60 hover:bg-black text-white p-2 rounded-lg backdrop-blur-md border border-white/10 shadow-xl transition-all"
                title="Download"
              >
                <Download size={14} />
              </a>
            </div>
          )}
          
          {/* Model Badge */}
          {!post.imageLoading && !isRegenerating && (
             <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-none">
                <span className="text-[9px] uppercase tracking-wider bg-black/80 text-neutral-400 px-2 py-1 rounded border border-white/5 backdrop-blur-sm">
                  {isProMode ? 'Gemini 3 Pro' : 'Nano Banana'}
                </span>
             </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="absolute bottom-full left-0 right-0 bg-[#0a0a0a] border-t border-x border-neutral-800 rounded-t-xl p-5 shadow-2xl z-20 animate-in slide-in-from-bottom-5">
             <div className="flex justify-between items-center mb-4">
               <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Image Parameters</h4>
               <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white transition-colors">✕</button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-xs text-neutral-500 mb-1.5 font-medium">Prompt</label>
                   <textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300 focus:outline-none focus:border-fuchsia-500/50 h-16 resize-none"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs text-neutral-500 mb-1.5 font-medium">Aspect Ratio</label>
                      <div className="relative">
                        <select 
                            value={customAR} 
                            onChange={(e) => setCustomAR(e.target.value as AspectRatio)}
                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none focus:border-fuchsia-500/50 appearance-none"
                        >
                            {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ar => (
                            <option key={ar} value={ar}>{ar}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                   </div>
                   <div className={!isProMode ? 'opacity-50 pointer-events-none' : ''}>
                      <label className="block text-xs text-neutral-500 mb-1.5 font-medium flex items-center justify-between">
                        Resolution
                        {!isProMode && <Zap size={10} className="text-amber-500" />}
                      </label>
                      <div className="relative">
                        <select 
                            value={customRes} 
                            onChange={(e) => setCustomRes(e.target.value as ImageResolution)}
                            disabled={!isProMode}
                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none focus:border-fuchsia-500/50 disabled:cursor-not-allowed appearance-none"
                        >
                            <option value="1K">1K</option>
                            <option value="2K">2K (Pro)</option>
                            <option value="4K">4K (Pro)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                           <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                   </div>
                </div>

                <GradientButton 
                  onClick={handleRegenerateImage}
                  className="w-full h-9 text-sm"
                  variant='primary'
                >
                  <RefreshCw size={14} />
                  <span>Regenerate</span>
                </GradientButton>
             </div>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};
