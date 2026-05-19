function Load() {
    return (
        <div className="loader" aria-label="Chargement en cours">
            <svg height="0" width="0" viewBox="0 0 64 64" className="absolute">
                <defs className="s-xJBuHA073rTt" xmlns="http://www.w3.org/2000/svg">
                    <linearGradient className="s-xJBuHA073rTt" gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="b">
                        <stop className="s-xJBuHA073rTt" stopColor="#20d6d2"></stop>
                        <stop className="s-xJBuHA073rTt" stopColor="#00a9c6" offset="1"></stop>
                    </linearGradient>
                    <linearGradient className="s-xJBuHA073rTt" gradientUnits="userSpaceOnUse" y2="0" x2="0" y1="64" x1="0" id="c">
                        <stop className="s-xJBuHA073rTt" stopColor="#20d6d2"></stop>
                        <stop className="s-xJBuHA073rTt" stopColor="#00a9c6" offset="1"></stop>
                    </linearGradient>
                    <linearGradient className="s-xJBuHA073rTt" gradientUnits="userSpaceOnUse" y2="2" x2="0" y1="62" x1="0" id="d">
                        <stop className="s-xJBuHA073rTt" stopColor="#20d6d2"></stop>
                        <stop className="s-xJBuHA073rTt" stopColor="#00a9c6" offset="1"></stop>
                    </linearGradient>
                </defs>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 64 64" height="64" width="64" className="inline-block">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" stroke="url(#b)" d="M 10 54 V 10 L 32 35 L 54 10 V 54" className="dash" id="m" pathLength="360"></path>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" style={{ "--rotation-duration": "0ms", "--rotation-direction": "normal" }} viewBox="0 0 64 64" height="64" width="64" className="inline-block">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" stroke="url(#c)" d="M 50 10 H 14 V 54 H 50 M 14 32 H 44" className="dash" id="e" pathLength="360"></path>
            </svg>
            <div className="w-2"></div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" style={{ "--rotation-duration": "0ms", "--rotation-direction": "normal" }} viewBox="0 0 64 64" height="64" width="64" className="inline-block">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="8" stroke="url(#d)" d="M 14 10 V 54 H 34 C 46 54 52 46 52 32 C 52 18 46 10 34 10 Z" className="dash" id="d-letter" pathLength="360"></path>
            </svg>
        </div>
    );
}

export default Load;