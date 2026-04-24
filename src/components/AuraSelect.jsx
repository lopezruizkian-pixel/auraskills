import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const AuraSelect = ({ options, value, onChange, placeholder, icon: Icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => (opt.value || opt) === value);
  const displayValue = selectedOption ? (selectedOption.label || selectedOption) : placeholder;

  return (
    <div className="aura-select-wrapper" ref={dropdownRef} style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "220px", position: "relative" }}>
      {label && <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginLeft: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</span>}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`aura-select-custom ${isOpen ? "active" : ""}`}
        style={{
          background: "#0d0d1a",
          border: isOpen ? "1px solid #00ffff" : "1px solid rgba(0, 255, 255, 0.2)",
          borderRadius: "14px",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: isOpen ? "0 0 20px rgba(0, 255, 255, 0.15)" : "inset 0 0 10px rgba(0,0,0,0.5)",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {Icon && <Icon size={16} color="#00ffff" />}
          <span style={{ color: selectedOption ? "#fff" : "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
            {displayValue}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          style={{ 
            color: isOpen ? "#00ffff" : "rgba(255,255,255,0.3)", 
            transition: "transform 0.3s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
          }} 
        />
      </div>

      {/* Lista Desplegable Personalizada */}
      {isOpen && (
        <div className="aura-dropdown-list" style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          right: 0,
          background: "#0d0d1a",
          border: "1px solid rgba(0, 255, 255, 0.3)",
          borderRadius: "14px",
          overflow: "hidden",
          zIndex: 1000,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(0, 255, 255, 0.1)",
          animation: "auraFadeIn 0.2s ease-out"
        }}>
          <div style={{ maxHeight: "250px", overflowY: "auto", padding: "6px" }}>
            {options.map((opt, i) => {
              const optValue = opt.value || opt;
              const optLabel = opt.label || opt;
              const isSelected = optValue === value;

              return (
                <div
                  key={i}
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                  className="aura-option"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    color: isSelected ? "#00ffff" : "#ccc",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    background: isSelected ? "rgba(0, 255, 255, 0.1)" : "transparent",
                    transition: "all 0.2s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2px"
                  }}
                >
                  {optLabel}
                  {isSelected && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00ffff", boxShadow: "0 0 8px #00ffff" }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes auraFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aura-select-custom:hover {
          border-color: rgba(0, 255, 255, 0.5);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
        }
        .aura-option:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: #fff !important;
          padding-left: 18px !important;
        }
        /* Custom scrollbar for dropdown */
        .aura-dropdown-list div::-webkit-scrollbar {
          width: 4px;
        }
        .aura-dropdown-list div::-webkit-scrollbar-track {
          background: transparent;
        }
        .aura-dropdown-list div::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AuraSelect;
