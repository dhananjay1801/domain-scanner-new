'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Shield,
  Layout
} from 'lucide-react';
import { getQuestions, submitAssessment } from '@/api/assessment';

interface Option {
  option_key: string;
  option_text: string;
  score: number;
}

interface Question {
  _id: string;
  category_id: number;
  category_name: string;
  question_text: string;
  options: Option[];
}

export default function QuestionnairePage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (err) {
        setError('Failed to load questionnaire. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Group questions by category
  const categories = Array.from(new Set(questions.map(q => q.category_name.trim())));
  const currentCategory = categories[currentCategoryIndex];
  const questionsInCategory = questions.filter(q => q.category_name.trim() === currentCategory);

  const handleOptionSelect = (questionId: any, optionKey: string) => {
    const idStr = String(questionId);
    setAnswers(prev => ({ ...prev, [idStr]: optionKey }));
  };

  const isCategoryComplete = () => {
    if (!questionsInCategory.length) return false;
    return questionsInCategory.every(q => {
      const answer = answers[String(q._id)];
      return answer !== undefined && answer !== null && answer !== '';
    });
  };

  const handleNext = () => {
    if (isCategoryComplete() && currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([id, key]) => ({
        questionId: id,
        selectedOption: key as "A" | "B" | "C" | "D"
      }));
      await submitAssessment(formattedAnswers);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to submit assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 text-slate-500 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="font-bold uppercase tracking-widest text-sm">Initializing Security Questionnaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-8 gap-6 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-100">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 uppercase">Initialization Error</h2>
          <p className="text-sm text-red-500 font-medium">{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all">
          Retry
        </button>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-full bg-[#fcfcfc] p-8 flex flex-col gap-8 max-w-5xl mx-auto">
      
      {/* Header & Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <Shield className="text-blue-600" size={24} />
               Security Posture Assessment
            </h1>
            <p className="text-sm text-slate-500 font-medium">Step {currentCategoryIndex + 1} of {categories.length}: {currentCategory}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{answeredCount} of {totalQuestions} answered</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-blue-600 h-full"
          />
        </div>
      </div>

      {/* Questions Area */}
      <div className="space-y-10 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {questionsInCategory.map((q, qIdx) => (
              <div key={q._id} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">Question {questions.indexOf(q) + 1}</span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{q.question_text}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt) => {
                    const isSelected = answers[String(q._id)] === opt.option_key;
                    return (
                      <button
                        key={opt.option_key}
                        onClick={() => handleOptionSelect(q._id, opt.option_key)}
                        className={`group p-5 rounded-[2rem] border transition-all text-left flex items-start gap-4 ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-white border-slate-100 hover:border-blue-400 hover:bg-blue-50/30 text-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black flex-shrink-0 transition-all ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}>
                          {opt.option_key}
                        </div>
                        <span className={`text-[13px] font-bold leading-relaxed pt-1 flex-1 ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                          {opt.option_text}
                        </span>
                        {isSelected && <CheckCircle2 size={18} className="mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentCategoryIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
              currentCategoryIndex === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {currentCategoryIndex === categories.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isCategoryComplete() || isSubmitting}
              className={`flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:grayscale disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Complete Assessment
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isCategoryComplete()}
              className={`flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-bold text-sm transition-all shadow-xl shadow-blue-600/10 active:scale-95 disabled:grayscale disabled:opacity-50`}
            >
              Next Category
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
