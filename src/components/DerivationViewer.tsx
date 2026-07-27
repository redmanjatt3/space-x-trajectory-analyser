import React, { useState } from 'react';
import { TOPIC_DERIVATIONS } from '../data/derivations';
import { TopicDerivation } from '../types';
import { MathFormula } from './MathFormula';
import { BookOpen, Flame, Wind, Compass, Shield, Target, Orbit, Layers, ChevronRight, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

export const DerivationViewer: React.FC = () => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TOPIC_DERIVATIONS[0].id);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const selectedTopic = TOPIC_DERIVATIONS.find((t) => t.id === selectedTopicId) || TOPIC_DERIVATIONS[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PROPULSION':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'AERODYNAMICS':
        return <Wind className="w-4 h-4 text-[#38BDF8]" />;
      case 'GRAVITY_TURN':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'REENTRY':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'LANDING':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'ORBITAL':
        return <Orbit className="w-4 h-4 text-blue-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#8B949E]" />;
    }
  };

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-[#0D1117] px-6 py-5 border-b border-[#30363D] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#F0F6FC] flex items-center space-x-2">
              <span>Rigorously Derived SpaceX Physics & Mathematics</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-[#8B949E]">
              Step-by-step mathematical proofs, differential equations, and physical conservation laws
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Selector Sidebar + Step-by-Step Mathematical Solver */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Sidebar Topic List */}
        <div className="lg:col-span-4 border-r border-[#30363D] bg-[#0D1117] p-3 space-y-1.5 overflow-y-auto max-h-[600px]">
          <div className="text-[11px] font-mono font-bold text-[#8B949E] px-3 py-2 uppercase tracking-wider">
            Derivation Modules ({TOPIC_DERIVATIONS.length})
          </div>

          {TOPIC_DERIVATIONS.map((topic) => {
            const isSelected = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setActiveStepIndex(0);
                }}
                className={`w-full text-left p-3 rounded-xl transition flex items-start space-x-3 group ${
                  isSelected
                    ? 'bg-[#3B82F6]/10 border border-[#3B82F6] text-[#F0F6FC]'
                    : 'hover:bg-[#21262D] text-[#8B949E] border border-transparent'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-[#161B22] border border-[#30363D]">
                  {getCategoryIcon(topic.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F0F6FC] truncate">{topic.title}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition ${isSelected ? 'text-[#38BDF8] translate-x-0.5' : 'text-[#8B949E]'}`} />
                  </div>
                  <p className="text-[11px] text-[#8B949E] line-clamp-1 mt-0.5">{topic.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mathematical Solver Detail View */}
        <div className="lg:col-span-8 p-6 space-y-6 overflow-y-auto max-h-[600px] bg-[#161B22]">
          {/* Active Topic Header */}
          <div className="border-b border-[#30363D] pb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-[#21262D] border border-[#30363D] text-[10px] font-mono font-bold text-[#38BDF8] uppercase">
                {selectedTopic.category}
              </span>
              <span className="text-xs text-[#8B949E] font-mono">• {selectedTopic.steps.length} Derivation Steps</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#F0F6FC]">{selectedTopic.title}</h3>
            <p className="text-sm text-[#C9D1D9] leading-relaxed">{selectedTopic.summary}</p>
          </div>

          {/* Step Stepper Tabs */}
          <div className="flex flex-wrap gap-2">
            {selectedTopic.steps.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <button
                  key={step.stepNumber}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                    isActive
                      ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20'
                      : 'bg-[#0D1117] border border-[#30363D] text-[#8B949E] hover:text-white'
                  }`}
                >
                  <span>Step {step.stepNumber}</span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Active Step Derivation Card */}
          {selectedTopic.steps[activeStepIndex] && (
            <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-6 space-y-5 shadow-inner">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-[#38BDF8] flex items-center space-x-2">
                  <span>Step {selectedTopic.steps[activeStepIndex].stepNumber}: {selectedTopic.steps[activeStepIndex].title}</span>
                </h4>
              </div>

              {/* LaTeX Equation Box */}
              <div className="bg-[#161B22] border border-[#38BDF8]/30 rounded-xl p-4 shadow-xl">
                <MathFormula formula={selectedTopic.steps[activeStepIndex].latexFormula} block={true} />
              </div>

              {/* Conceptual Explanation */}
              <p className="text-sm text-[#C9D1D9] leading-relaxed">
                {selectedTopic.steps[activeStepIndex].explanation}
              </p>

              {/* Variable Legend Table */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono font-bold text-[#8B949E] flex items-center space-x-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>VARIABLE DEFINITIONS & UNITS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedTopic.steps[activeStepIndex].variableDefinitions.map((v, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0D1117] p-2 rounded-lg border border-[#30363D]">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-[#38BDF8]">{v.symbol}</span>
                        <span className="text-[#C9D1D9]">{v.meaning}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded border border-[#30363D]">{v.unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Insight Callout */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-200 leading-relaxed">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">💡 Physical Intuition:</span>
                {selectedTopic.steps[activeStepIndex].physicalInsight}
              </div>
            </div>
          )}

          {/* SpaceX Practical Application Box */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 text-xs text-[#C9D1D9] space-y-1">
            <span className="font-bold text-[#38BDF8] uppercase tracking-wider block">🚀 SpaceX Flight Computer Implementation:</span>
            <p className="leading-relaxed text-[#8B949E]">{selectedTopic.practicalSpaceXContext}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
