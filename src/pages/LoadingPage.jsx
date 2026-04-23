import React from 'react';

const LoadingPage = () => {
    return (
        <div className="pharmacy-loading-page">
            <style>{`
                .pharmacy-loading-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f0fdf4;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                .pharmacy-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }

                .pharmacy-loader svg {
                    width: 120px;
                    height: 120px;
                }

                .pharmacy-loader .cross {
                    fill: #2ecc71;
                    animation: glow-cross 2s ease-in-out infinite;
                }

                .pharmacy-loader .pulse {
                    fill: none;
                    stroke: #ffffff;
                    stroke-width: 5;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    stroke-dasharray: 120;
                    stroke-dashoffset: 120;
                    animation: snake 2s linear infinite;
                }

                .pharmacy-loader .text {
                    color: #2ecc71;
                    font-size: 1.2rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    animation: blink 1.5s ease-in-out infinite;
                }

                @keyframes snake {
                    0% {
                        stroke-dashoffset: 120;
                    }
                    50% {
                        stroke-dashoffset: 0;
                    }
                    100% {
                        stroke-dashoffset: -120;
                    }
                }

                @keyframes glow-cross {
                    0%, 100% {
                        filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.4));
                        transform: scale(1) translateY(0);
                        transform-origin: 50% 50%;
                    }
                    50% {
                        filter: drop-shadow(0 0 20px rgba(46, 204, 113, 0.8));
                        transform: scale(1.05) translateY(-5px);
                        transform-origin: 50% 50%;
                    }
                }

                @keyframes blink {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
            `}</style>

            <div className="pharmacy-loader" role="status" aria-live="polite">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                    <path className="cross" d="M35 15 h30 v20 h20 v30 h-20 v20 h-30 v-20 h-20 v-30 h20 z" />
                    <path className="pulse" d="M15 50 l15 0 l10 -20 l15 40 l15 -20 l7 0 l8 0" />
                </svg>
                <div className="text">LOADING...</div>
            </div>
        </div>
    );
};

export default LoadingPage;
