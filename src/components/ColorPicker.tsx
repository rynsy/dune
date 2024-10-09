import React, { useState, useRef, useEffect } from 'react';
import { ChromePicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleChange = (newColor: ColorResult) => {
    onChange(newColor.hex);
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={pickerRef} style={{ position: 'relative' }}>
      <div
        onClick={togglePicker}
        style={{
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '14px',
            borderRadius: '2px',
            background: color,
          }}
        />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 2, marginTop: '5px' }}>
          <ChromePicker color={color} onChange={handleChange} disableAlpha={true} />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
