interface ControlBlockProps {
  type: string;
  title: string;
}

export default function ControlBlock({ type, title }: ControlBlockProps) {
  const getSubtitle = (blockType: string) => {
    switch (blockType) {
      case 'pid-controller':
        return 'Kp=1, Ki=0.1, Kd=0.05';
      case 'transfer-function':
        return '1/(s+1)';
      case 'gain-block':
        return 'K=1.0';
      case 'step-input':
        return 'Amp=1.0';
      case 'sine-wave':
        return 'f=1Hz';
      default:
        return '';
    }
  };

  const getColor = (blockType: string) => {
    switch (blockType) {
      case 'pid-controller':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'transfer-function':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'gain-block':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'step-input':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'sine-wave':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-2 h-full flex items-center justify-center">
      <div className={`
        rounded-lg border-2 p-3 min-w-[120px] text-center relative
        ${getColor(type)}
      `}>
        {/* Input connection point */}
        <div className="absolute left-0 top-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        
        <div className="text-xs font-medium">{title}</div>
        {getSubtitle(type) && (
          <div className="text-xs opacity-70 mt-1">{getSubtitle(type)}</div>
        )}
        
        {/* Output connection point */}
        <div className="absolute right-0 top-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full transform translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}