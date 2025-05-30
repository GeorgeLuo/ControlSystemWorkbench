export default function Oscilloscope() {
  return (
    <div className="p-4 h-full">
      <div className="bg-gray-900 rounded h-full relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 p-4">
          <div 
            className="w-full h-full opacity-20 border border-green-500"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(34, 197, 94, 0.3) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(34, 197, 94, 0.3) 20px)',
              backgroundSize: '20px 20px'
            }}
          />
        </div>
        
        {/* Waveform display */}
        <svg className="absolute inset-4 w-full h-full">
          {/* Input signal waveform */}
          <path
            d="M 0 120 Q 50 80 100 120 T 200 120 T 300 120"
            stroke="#00ff00"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          
          {/* Output signal waveform */}
          <path
            d="M 0 140 Q 50 100 100 140 T 200 140 T 300 140"
            stroke="#ffff00"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
        </svg>
        
        {/* Channel labels */}
        <div className="absolute top-2 left-2 space-y-1">
          <div className="text-green-400 text-xs font-mono">CH1: Input Signal</div>
          <div className="text-yellow-400 text-xs font-mono">CH2: Output Signal</div>
        </div>
        
        {/* Measurement info */}
        <div className="absolute bottom-2 right-2 text-green-400 text-xs font-mono">
          <div>Time: 10ms/div</div>
          <div>Volt: 1V/div</div>
        </div>
      </div>
    </div>
  );
}
