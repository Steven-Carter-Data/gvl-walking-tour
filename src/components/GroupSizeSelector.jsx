import { useState } from 'react';

function GroupSizeSelector({ onGroupSelect, onBack }) {
  const [selectedSize, setSelectedSize] = useState(null);
  
  const groupOptions = [
    {
      id: 'individual',
      title: 'Just me',
      subtitle: 'Pay what you want',
      description: 'Perfect for solo exploration',
      icon: '👤',
      pricing: 'flexible'
    },
    {
      id: 'small-group',
      title: '2-4 people',
      subtitle: 'Recommend $15',
      description: 'Great for couples & small groups',
      icon: '👥',
      pricing: 15,
      savings: 'Save up to $9'
    },
    {
      id: 'large-group',
      title: '5+ people',
      subtitle: 'Recommend $25', 
      description: 'Perfect for families & larger groups',
      icon: '👪',
      pricing: 25,
      savings: 'Save up to $15+'
    }
  ];

  const handleGroupSelect = (groupOption) => {
    setSelectedSize(groupOption.id);
    onGroupSelect(groupOption);
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#e5e3dc'}}>
      {/* Header */}
      <div className="bc-primary-bg text-white">
        <div className="px-6 py-8">
          <button 
            onClick={onBack}
            className="flex items-center mb-4 text-white opacity-80 hover:opacity-100"
          >
            <span className="text-xl mr-2">←</span>
            Back
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-white bg-opacity-10 rounded-full">
              <div className="text-3xl">🎧</div>
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{color: '#9ca3af'}}>
              How many people are exploring with you today?
            </h1>
            <p className="text-xl" style={{color: '#9ca3af', opacity: 0.8}}>
              Choose your group size to see pricing
            </p>
          </div>
        </div>
      </div>

      {/* Group Options */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {groupOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleGroupSelect(option)}
              className={`
                relative p-6 rounded-2xl border-2 text-left transition-all duration-200
                ${selectedSize === option.id 
                  ? 'border-solid shadow-lg transform scale-[1.02]' 
                  : 'border-dashed hover:border-solid hover:shadow-md hover:transform hover:scale-[1.01]'
                }
                bc-card-bg
              `}
              style={{
                borderColor: selectedSize === option.id ? '#d4967d' : '#495a58'
              }}
            >
              {/* Icon */}
              <div className="text-4xl mb-4">{option.icon}</div>
              
              {/* Title and Subtitle */}
              <div className="mb-3">
                <h3 className="text-2xl font-bold mb-1" style={{color: '#303636'}}>
                  {option.title}
                </h3>
                <div className="text-xl font-semibold" style={{color: '#d4967d'}}>
                  {option.subtitle}
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm mb-3" style={{color: '#495a58'}}>
                {option.description}
              </p>
              
              {/* Savings Badge */}
              {option.savings && (
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium border-2" style={{
                  color: '#d4967d', 
                  borderColor: '#d4967d',
                  backgroundColor: 'transparent'
                }}>
                  {option.savings}
                </div>
              )}
              
              {/* Selected Indicator */}
              {selectedSize === option.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{backgroundColor: '#d4967d'}}>
                    ✓
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Value Props */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bc-card-bg rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-4" style={{color: '#303636'}}>
                What You Get
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="text-2xl mr-3">🎧</div>
                <div>
                  <div className="font-semibold mb-1" style={{color: '#303636'}}>
                    Professional Audio Tour
                  </div>
                  <div className="text-sm" style={{color: '#495a58'}}>
                    8 GPS-triggered stops with expert narration
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-3">📱</div>
                <div>
                  <div className="font-semibold mb-1" style={{color: '#303636'}}>
                    Lifetime Access
                  </div>
                  <div className="text-sm" style={{color: '#495a58'}}>
                    Use anytime, share with your group
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-3">🗺️</div>
                <div>
                  <div className="font-semibold mb-1" style={{color: '#303636'}}>
                    Interactive Map
                  </div>
                  <div className="text-sm" style={{color: '#495a58'}}>
                    Real-time GPS tracking & navigation
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-2xl mr-3">⭐</div>
                <div>
                  <div className="font-semibold mb-1" style={{color: '#303636'}}>
                    Self-Paced Experience
                  </div>
                  <div className="text-sm" style={{color: '#495a58'}}>
                    ~45 minutes or take your time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupSizeSelector;