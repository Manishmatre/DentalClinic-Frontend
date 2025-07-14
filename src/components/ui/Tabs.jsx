import React, { useRef, useEffect, useState } from 'react';

const Tabs = ({ tabs, activeTab, onChange }) => {
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);

  useEffect(() => {
    const idx = tabs.findIndex(tab => tab.id === activeTab);
    if (tabRefs.current[idx]) {
      const node = tabRefs.current[idx];
      setUnderlineStyle({
        left: node.offsetLeft,
        width: node.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="relative">
      <div className="border-b border-gray-200 relative">
        <nav className="-mb-px flex space-x-8 relative" aria-label="Tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={el => (tabRefs.current[i] = el)}
              onClick={() => onChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm bg-transparent
                transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
          {/* Animated underline */}
          <span
            className="absolute bottom-0 h-0.5 bg-indigo-500 rounded transition-all duration-300"
            style={{
              left: underlineStyle.left || 0,
              width: underlineStyle.width || 0,
            }}
          />
        </nav>
      </div>
    </div>
  );
};

export default Tabs; 