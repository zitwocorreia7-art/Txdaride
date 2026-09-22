import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Check, Crown, Heart, MessageSquare, ShieldCheck, Sparkles, Star, ThumbsUp, X } from 'lucide-react';
import { Driver } from '../../types';

interface RatingModalProps {
  isOpen: boolean;
  driver: Driver;
  finalFareCVE: number;
  pointsEarned?: number;
  onClose: () => void;
  onSubmitRating: (rating: number, review: string, tipCVE: number, complimentTags: string[]) => void;
  t: Record<string, string>;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  driver,
  finalFareCVE,
  pointsEarned = 0,
  onClose,
  onSubmitRating,
  t,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTip, setSelectedTip] = useState<number>(100);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Morabeza Total', 'Condução Segura']);
  const [reviewText, setReviewText] = useState<string>('');

  if (!isOpen) return null;

  const compliments = [
    'Morabeza Total 🇨🇻',
    'Condução Segura',
    'Carro Limpo & Cheiroso',
    'Ar Condicionado Excelente',
    'Música Cabo-Verdiana Boa',
    'Pontual & Simpático',
  ];

  const tipOptions = [0, 50, 100, 200, 300];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSubmitRating(rating, reviewText, selectedTip, selectedTags);
  };

  return (
    <div id="rating-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <img
            src={driver.avatar}
            alt={driver.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 mx-auto shadow-lg"
          />
          <h3 className="text-lg font-extrabold text-white mt-2">
            Como foi a viagem com {driver.name.split(' ')[0]}?
          </h3>
          <p className="text-xs text-slate-400">
            {driver.vehicle.make} {driver.vehicle.model} • <span className="font-mono font-bold text-amber-400">{driver.vehicle.plate}</span>
          </p>

          {/* Loyalty Points Earned & Bonus Callout */}
          {pointsEarned > 0 && (
            <div className="mt-3 py-2 px-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-center animate-in fade-in duration-200">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Ganhou +{pointsEarned} Pontos Txada Club!</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-0.5">
                Avalie o motorista para ganhar mais <strong>+10 Pontos de bónus</strong> 🇨🇻
              </p>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                id={`star-${star}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="inline-block mt-1 text-xs font-semibold text-amber-300">
            {rating === 5 ? 'Excelente! 5 estrelas' : rating === 4 ? 'Muito Bom' : rating === 3 ? 'Bom' : 'A melhorar'}
          </span>
        </div>

        {/* Compliment Tags */}
        <div className="mt-5">
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-2 text-center">
            Elogiar o Motorista:
          </label>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {compliments.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                    isSelected
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Tip in CVE */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Adicionar Gratificação (Gorjeta):
            </span>
            <span className="text-[10px] text-slate-400">100% para o motorista</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {tipOptions.map((tip) => (
              <button
                key={tip}
                type="button"
                id={`tip-${tip}`}
                onClick={() => setSelectedTip(tip)}
                className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                  selectedTip === tip
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {tip === 0 ? 'Sem' : `${tip}`}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Review Comment */}
        <div className="mt-4">
          <textarea
            placeholder="Deixe um comentário sobre a sua experiência..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-5">
          <button
            id="btn-submit-rating"
            onClick={handleSubmit}
            className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Enviar Avaliação & Concluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
