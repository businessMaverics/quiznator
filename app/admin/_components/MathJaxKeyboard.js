"use client";

import React from "react";
import { X } from "lucide-react";

const MathJaxKeyboard = ({ onSelect, onClose }) => {
    const groups = [
        {
            name: "Basic Signs",
            symbols: [
                { label: "+", value: "+" },
                { label: "−", value: "-" },
                { label: "×", value: "\\times " },
                { label: "÷", value: "\\div " },
                { label: "=", value: "=" },
                { label: "≠", value: "\\neq " },
                { label: "±", value: "\\pm " },
                { label: "≈", value: "\\approx " },
            ],
        },
        {
            name: "Advanced",
            symbols: [
                { label: "√", value: "\\sqrt{}" },
                { label: "π", value: "\\pi " },
                { label: "∞", value: "\\infty " },
                { label: "θ", value: "\\theta " },
                { label: "Σ", value: "\\sum " },
                { label: "∫", value: "\\int " },
                { label: "Δ", value: "\\Delta " },
                { label: "μ", value: "\\mu " },
            ],
        },
        {
            name: "Layout/Power",
            symbols: [
                { label: "x²", value: "^2" },
                { label: "x³", value: "^3" },
                { label: "xⁿ", value: "^{}" },
                { label: "xₙ", value: "_{}" },
                { label: "frac", value: "\\frac{}{}" },
                { label: "( )", value: "()" },
                { label: "[ ]", value: "[]" },
                { label: "{ }", value: "{}" },
            ],
        },
    ];

    return (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-64 md:w-80">
            <div className="bg-purple-900/30 p-3 flex justify-between items-center border-b border-white/10">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Math Symbols</span>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>
            <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                {groups.map((group) => (
                    <div key={group.name}>
                        <h3 className="text-[10px] text-gray-500 uppercase font-black mb-2 tracking-tighter">{group.name}</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {group.symbols.map((symbol) => (
                                <button
                                    key={symbol.label}
                                    onClick={() => onSelect(symbol.value)}
                                    className="bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/10 text-white p-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center aspect-square"
                                    title={symbol.value}
                                >
                                    {symbol.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-black/40 text-[9px] text-gray-500 text-center italic">
                Tip: Wrap expressions in $...$ for MathJax rendering.
            </div>
        </div>
    );
};

export default MathJaxKeyboard;
