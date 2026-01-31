import React, { useState } from 'react';
import SpotlightCard from './SpotlightCard';
import GradientButton from './GradientButton';
import DecryptedText from './DecryptedText';
import { X, Loader2 } from 'lucide-react';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const GOOGLE_SCRIPT_URL = "INSERT_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"; 

const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    price: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== "INSERT_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (error) {
        console.error("Error", error);
      }
    }

    setLoading(false);
    onSubmit();
  };

  const prices = ['$5', '$10', '$20'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Max width set to 360px for compact box */}
      <div className="w-full max-w-[360px] relative">
        <SpotlightCard className="w-full shadow-2xl border border-neutral-800 bg-[#0a0a0a]">
          <div className="p-4 relative z-10">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></span>
                <DecryptedText text="Beta Access" speed={50} />
              </h2>
              <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              <div className="grid grid-cols-2 gap-2">
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-md px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-fuchsia-500/50"
                    placeholder="Name"
                  />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-md px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-fuchsia-500/50"
                    placeholder="Email"
                  />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1 block">
                  Monthly Price?
                </label>
                <div className="flex gap-1.5">
                  {prices.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({...formData, price: p})}
                      className={`flex-1 py-1 rounded-md text-[10px] font-medium border transition-all ${
                        formData.price === p
                          ? 'bg-fuchsia-900/30 border-fuchsia-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={!prices.includes(formData.price) ? formData.price : ''}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-[70px] bg-neutral-900/50 border border-neutral-800 rounded-md px-2 py-1 text-[10px] text-white focus:outline-none focus:border-fuchsia-500/50 text-center"
                    placeholder="Custom"
                  />
                </div>
              </div>

              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-neutral-900/50 border border-neutral-800 rounded-md px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-fuchsia-500/50"
                placeholder="Phone (Optional)"
              />

              <GradientButton type="submit" className="w-full h-8 text-[11px] mt-1" disabled={loading}>
                {loading ? <Loader2 size={12} className="animate-spin" /> : <span>Submit & Upgrade</span>}
              </GradientButton>

            </form>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default SurveyModal;
