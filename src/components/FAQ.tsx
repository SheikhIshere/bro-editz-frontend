"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Plus, Minus, Loader2 } from "lucide-react";
import { cachedGet } from "@/lib/axios";
import axiosInstance from "@/lib/axios";
import { DUMMY_FAQS } from "@/data/dummy";

interface FaqItemData {
  id: number;
  question: string;
  answer: string;
  is_featured: boolean;
}

const DEFAULT_FAQS = DUMMY_FAQS;

const FAQItem = ({ faq, isOpen, toggle }: { faq: { question: string, answer: string }, isOpen: boolean, toggle: () => void }) => {
  return (
    <div className={`rounded-[2rem] transition-all duration-500 mb-4 ${isOpen ? 'bg-white/5 border border-white/10 p-2' : 'bg-white/[0.03] border border-white/5 hover:border-white/10'}`}>
      <button
        onClick={toggle}
        className={`w-full flex items-center justify-between p-8 text-left transition-all rounded-2xl ${isOpen ? 'bg-accent-primary/5' : 'hover:bg-white/5'}`}
      >
        <span className={`text-lg md:text-xl font-bold tracking-tight ${isOpen ? 'text-white' : 'text-text-muted hover:text-white'}`}>
          {faq.question}
        </span>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all ${isOpen ? 'bg-accent-primary border-accent-primary text-white' : 'border-white/10 text-text-muted'}`}>
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 pt-2">
              <p className="text-white/60 text-base leading-relaxed font-light">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>(DEFAULT_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await cachedGet("/faqs/");
        // Backend returns { count, next, previous, results }
        if (res?.data?.results) {
          setFaqs(res.data.results);
        } else if (res?.data) {
          setFaqs(Array.isArray(res.data) ? res.data : []);
        } else {
          setFaqs([]);
        }
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
      }
    };
    fetchFaqs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitted(false);
    setError("");

    try {
      const res = await axiosInstance.post("/faqs/create/", {
        question: question.trim(),
      });
      if (res?.data?.question) {
        setFaqs(prev => [res.data, ...prev]);
        setQuestion("");
        setSubmitted(true);
      } else {
        setError("Failed to submit question");
      }
    } catch (err) {
      console.error("FAQ submission error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={containerRef} id="faq" className="py-32 relative z-10 bg-background overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-[10%] right-[-10%] w-[30%] h-[30%] bg-accent-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[30%] bg-accent-secondary/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto px-6 relative z-10"
      >
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white"
          >
            Common <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#023E8A] via-[#49CADF] to-[#023E8A]">Questions</span>
          </motion.h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto font-light">
            Everything you need to know about our workflow and how we help your brand grow.
          </p>
        </div>

        <div className="space-y-2 mb-20">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              toggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-10 rounded-[3rem] border border-white/10 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
              <p className="text-text-muted text-sm mb-8">Can't find what you're looking for? Ask us anything.</p>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder="Type your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-background border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-accent-primary transition-colors resize-none disabled:opacity-50"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !question.trim()}
                      className="py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: '#0094C8', color: 'white' }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Question"
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 space-y-4"
                  >
                    <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary mx-auto mb-4 border border-accent-primary/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-white uppercase tracking-tighter">Successfully Submitted!</h4>
                    <p className="text-text-muted text-sm italic">Our team will get back to you shortly.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/10 blur-[60px] pointer-events-none" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FAQ;
