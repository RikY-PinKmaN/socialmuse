import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Zap, Crown } from 'lucide-react';
import { generateTextContent, generateSocialImage } from './services/geminiService';
import { GeneratedPost, Tone, ImageResolution } from './types';
import { PostCard } from './components/PostCard';
import FloatingLines from './components/FloatingLines';
import SpotlightCard from './components/SpotlightCard';
import DecryptedText from './components/DecryptedText';
import GradientButton from './components/GradientButton';
import SplitText from './components/SplitText';
import GlobalStyles from './components/GlobalStyles';
import SurveyModal from './components/SurveyModal';

const TONES: Tone[] = ['Professional', 'Witty', 'Urgent', 'Friendly', 'Visionary'];

export default function App() {
  // Global State
  const [isProMode, setIsProMode] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  
  // Input State
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState<Tone>('Professional');
  const [globalResolution, setGlobalResolution] = useState<ImageResolution>('1K');
  
  // Output State
  const [loadingText, setLoadingText] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);

  // Init - Check for API Key
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsProMode(hasKey);
        } catch (e) {
          console.error("Error checking API key status", e);
          setIsProMode(false);
        }
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleOpenSurvey = () => {
    setIsSurveyOpen(true);
  };

  const handleSurveySubmit = async () => {
    setIsSurveyOpen(false);
    // Proceed to standard key selection
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setIsProMode(true);
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setLoadingText(true);
    setPosts([]);

    try {
      // 1. Generate Text Content (Using Pro or Standard model based on key selection)
      const result = await generateTextContent(idea, tone, isProMode);
      
      // 2. Initialize Posts with Text and Loading State for Images
      const newPosts: GeneratedPost[] = [
        {
          platform: 'LinkedIn',
          content: result.linkedin.content,
          imagePrompt: result.linkedin.imagePrompt,
          aspectRatio: '16:9',
          imageLoading: true,
          imageUrl: undefined
        },
        {
          platform: 'Twitter',
          content: result.twitter.content,
          imagePrompt: result.twitter.imagePrompt,
          aspectRatio: '16:9',
          imageLoading: true,
          imageUrl: undefined
        },
        {
          platform: 'Instagram',
          content: result.instagram.content,
          hashtags: result.instagram.hashtags,
          imagePrompt: result.instagram.imagePrompt,
          aspectRatio: '3:4', // Best for Insta Feed/Stories
          imageLoading: true,
          imageUrl: undefined
        }
      ];

      setPosts(newPosts);
      setLoadingText(false);

      // 3. Trigger Image Generation in Parallel
      newPosts.forEach((post, index) => {
        // Use Global Resolution if in Pro mode, otherwise default logic handles it (standard ignores res)
        generateSocialImage(post.imagePrompt, post.aspectRatio, globalResolution, isProMode)
          .then(url => {
            setPosts(currentPosts => {
              const updated = [...currentPosts];
              const idx = updated.findIndex(p => p.platform === post.platform);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], imageUrl: url, imageLoading: false };
              }
              return updated;
            });
          })
          .catch(err => {
            console.error(`Error generating image for ${post.platform}`, err);
             setPosts(currentPosts => {
              const updated = [...currentPosts];
              const idx = updated.findIndex(p => p.platform === post.platform);
              if (idx !== -1) {
                updated[idx] = { ...updated[idx], imageLoading: false };
              }
              return updated;
            });
          });
      });

    } catch (error) {
      console.error("Generation failed", error);
      setLoadingText(false);
      alert("Failed to generate content. Please try again.");
    }
  };

  const handleUpdatePost = (updatedPost: GeneratedPost) => {
    setPosts(current => current.map(p => p.platform === updatedPost.platform ? updatedPost : p));
  };

  if (checkingKey) {
     return <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
     </div>;
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col relative overflow-hidden font-sans">
      <GlobalStyles />
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
         <FloatingLines 
           linesGradient={['#d946ef', '#a855f7', '#ec4899']} 
           enabledWaves={['top', 'middle', 'bottom']}
           lineCount={6}
           lineDistance={5}
           animationSpeed={0.5}
         />
      </div>

      {/* Survey Modal */}
      <SurveyModal 
        isOpen={isSurveyOpen} 
        onClose={() => setIsSurveyOpen(false)} 
        onSubmit={handleSurveySubmit} 
      />

      {/* Navbar */}
      <header className="border-b border-neutral-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-default">
            {/* Logo removed */}
            <div className="font-bold text-xl tracking-tight text-white">
              <DecryptedText 
                text="SocialMuse" 
                speed={70} 
                animateOnHover={true}
                className="text-white"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
             {!isProMode ? (
               <div className="flex items-center space-x-3">
                  <span className="text-neutral-500 hidden sm:inline text-xs uppercase tracking-wider">Free Tier</span>
                  <GradientButton 
                    onClick={handleOpenSurvey}
                    className="px-3 py-1.5 text-xs h-8"
                  >
                    <Crown size={12} className="text-amber-400" />
                    <span>Upgrade</span>
                  </GradientButton>
               </div>
             ) : (
                <div className="flex items-center space-x-2 text-fuchsia-400 bg-fuchsia-950/30 px-3 py-1 rounded-full border border-fuchsia-500/20">
                   <Zap size={14} className="fill-fuchsia-400" />
                   <DecryptedText text="PRO ENABLED" speed={100} className="font-bold text-[10px] tracking-widest" />
                </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col relative z-10">
        
        {/* Intro Text */}
        <div className="flex justify-center mb-8 px-4">
          <SplitText 
            text="Draft, visualize, and optimize your social presence in seconds."
            className="text-2xl md:text-3xl font-light text-center text-neutral-300 max-w-2xl tracking-tight"
            delay={30}
          />
        </div>

        {/* Input Section */}
        <section className="mb-12 max-w-4xl mx-auto w-full">
          <SpotlightCard className="p-8">
             <div className="flex flex-col space-y-8 relative z-10">
                
                {/* Text Input */}
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-1">
                    What's your idea?
                  </label>
                  <div className="relative group">
                    <textarea
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Describe your content idea..."
                      className="w-full bg-black/40 border border-neutral-800 rounded-xl p-5 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-fuchsia-500/50 focus:bg-black/60 transition-all min-h-[120px] resize-y"
                    />
                    <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-fuchsia-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl"></div>
                  </div>
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Tone Selection */}
                   <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-1">
                        Tone
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TONES.map(t => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                              tone === t 
                                ? 'bg-fuchsia-950/40 border-fuchsia-500/50 text-fuchsia-100 shadow-[0_0_15px_rgba(217,70,239,0.2)]' 
                                : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                   </div>

                   {/* Global Image Settings */}
                   <div className={!isProMode ? 'opacity-50 grayscale' : ''}>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-1 flex items-center justify-between">
                        <div className="flex items-center">
                          <ImageIcon size={14} className="mr-2 text-fuchsia-500" />
                          Image Quality
                        </div>
                        {!isProMode && <span className="text-[9px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 border border-neutral-700">PRO ONLY</span>}
                      </label>
                      <div className="flex bg-black/40 rounded-lg p-1 border border-neutral-800 w-fit">
                        {['1K', '2K', '4K'].map((res) => (
                          <button
                            key={res}
                            onClick={() => isProMode && setGlobalResolution(res as ImageResolution)}
                            disabled={!isProMode}
                            className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${
                              globalResolution === res && isProMode
                                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                                : 'text-neutral-600 hover:text-neutral-400'
                            } ${!isProMode ? 'cursor-not-allowed' : ''}`}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Generate Button */}
                <GradientButton
                  onClick={handleGenerate}
                  disabled={loadingText || !idea.trim()}
                  className="w-full h-14 text-lg rounded-xl"
                >
                  {loadingText ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <DecryptedText text={isProMode ? "CREATING MASTERPIECE..." : "DRAFTING CONTENT..."} speed={70} />
                    </>
                  ) : (
                    <>
                      <span>Generate Campaign</span>
                    </>
                  )}
                </GradientButton>

             </div>
          </SpotlightCard>
        </section>

        {/* Results Grid */}
        {posts.length > 0 && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {posts.map((post) => (
              <div key={post.platform} className="h-full">
                <PostCard 
                  post={post} 
                  onUpdate={handleUpdatePost} 
                  globalResolution={globalResolution} 
                  isProMode={isProMode}
                />
              </div>
            ))}
          </section>
        )}

        {/* Empty State */}
        {posts.length === 0 && !loadingText && (
          <div className="flex-grow">
          </div>
        )}

      </main>
    </div>
  );
}