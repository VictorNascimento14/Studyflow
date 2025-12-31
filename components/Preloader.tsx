import React, { useEffect, useState } from 'react';

interface PreloaderProps {
    onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
    const [count, setCount] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Counter animation
        const duration = 3000; // 3s total
        const steps = 100;
        const intervalTime = duration / steps;

        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep <= steps) {
                setCount(currentStep);
            } else {
                clearInterval(timer);
                // Start exit sequence
                setTimeout(() => {
                    setIsExiting(true);
                    // Wait for exit animation then call onComplete
                    setTimeout(() => {
                        onComplete();
                    }, 1000); // 1s exit duration
                }, 400); // 400ms delay before exit
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 invisible' : 'opacity-100 visible'}`}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Glow Orbs */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, #6366f1, transparent)',
                        top: '20%',
                        left: '10%',
                        filter: 'blur(60px)',
                        opacity: 0.3,
                        animation: 'orbMove 10s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, #8b5cf6, transparent)',
                        bottom: '20%',
                        right: '10%',
                        filter: 'blur(60px)',
                        opacity: 0.3,
                        animation: 'orbMove 10s ease-in-out infinite 5s'
                    }}
                />

                {/* Grid Lines */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        opacity: 0.1
                    }}
                />

                {/* Particles */}
                {[...Array(9)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-[#6366f1]"
                        style={{
                            width: '4px',
                            height: '4px',
                            boxShadow: '0 0 10px #6366f1',
                            left: `${(i + 1) * 10}%`,
                            animation: `particleFloat ${6 + (i % 4)}s ease-in-out infinite ${i * 0.5}s`
                        }}
                    />
                ))}

                {/* Concentric Circles */}
                {[200, 400, 600].map((size, i) => (
                    <div
                        key={i}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(99,102,241,0.2)]"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            animation: `ripple 4s ease-out infinite ${i}s`
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <h1
                    className="text-[#6366f1] mb-8 font-extrabold tracking-tighter"
                    style={{
                        fontSize: 'clamp(48px, 5vw, 72px)',
                        animation: 'float 3s ease-in-out infinite'
                    }}
                >
                    studyflow
                </h1>

                {/* Graduation Cap */}
                <div
                    className="relative mb-8"
                    style={{
                        width: '60px',
                        height: '60px',
                        animation: 'float 3s ease-in-out infinite'
                    }}
                >
                    <div
                        className="absolute top-0 left-0 w-full h-2 rounded-sm"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute top-2 left-1/2 -translate-x-1/2 w-1/2 h-5"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)'
                        }}
                    />
                    <div
                        className="absolute top-1 right-2 w-0.5 h-4 bg-[#8b5cf6] origin-top"
                        style={{
                            animation: 'swing 2s ease-in-out infinite'
                        }}
                    />
                </div>

                {/* Counter */}
                <div
                    className="font-black leading-none mb-12 relative"
                    style={{
                        fontSize: 'clamp(96px, 10vw, 140px)',
                        letterSpacing: '-4px',
                        background: 'linear-gradient(45deg, #fff, #6366f1, #fff)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradientShift 3s ease infinite, fadeInUp 0.8s ease 0.2s forwards'
                    }}
                >
                    {count}
                    {/* Glow behind counter */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full"
                        style={{
                            width: '300px',
                            height: '300px',
                            background: 'rgba(99, 102, 241, 0.3)',
                            filter: 'blur(40px)',
                            animation: 'breathe 3s ease-in-out infinite'
                        }}
                    />
                </div>

                {/* Progress Bar Container */}
                <div className="relative w-[300px] md:w-[400px] h-0.5 bg-[#1a1a1a] rounded overflow-hidden">
                    {/* Progress Fill */}
                    <div
                        className="absolute top-0 left-0 h-full rounded transition-all duration-100 ease-linear"
                        style={{
                            width: `${count}%`,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1)',
                            backgroundSize: '200% 100%',
                            boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)',
                            animation: 'progressGlow 2s ease-in-out infinite'
                        }}
                    >
                        {/* Shimmer Effect */}
                        <div
                            className="absolute top-0 left-0 w-[100px] h-full"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4))',
                                animation: 'shimmer 1.5s infinite'
                            }}
                        />
                    </div>
                </div>

                {/* Loading Text */}
                <div
                    className="mt-4 text-[#666] font-semibold uppercase tracking-[3px] text-[13px]"
                    style={{
                        animation: 'textPulse 2s ease-in-out infinite'
                    }}
                >
                    Loading
                </div>
            </div>
        </div>
    );
};

export default Preloader;
