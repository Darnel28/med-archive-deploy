import { useState, useEffect } from "react";

function Hero() {
    const words = ["santé", "dossier", "avenir"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="slider-area position-relative">
            <div className="single-slider slider-height d-flex align-items-center">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-7 col-lg-9 col-md-8 col-sm-9">
                            <div className="hero__caption">
                                <span
                                    style={{
                                        display: "block",
                                        marginBottom: "18px",
                                        fontSize: "20px",
                                        fontWeight: 500,
                                        letterSpacing: "0.08em",
                                        color: "#0f61ee",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Engagé pour votre vie
                                </span>

                                <h1
                                    style={{
                                        marginTop: "20px",
                                        fontWeight: 650,
                                        fontSize: "72px",
                                        lineHeight: "1.08",
                                        letterSpacing: "0.01em",
                                    }}
                                >
                                    Nous <br />
                                    protégeons <br />
                                    votre{" "}
                                    <strong style={{ color: "#113468" }}>
                                        {words[index]}
                                    </strong>
                                </h1>

                                <p>
                                    Accédez à votre historique médical partout au Bénin grâce à votre NPI.
                                    Sécurisé, rapide et gratuit.
                                </p>

                                <a href="#" className="btn hero-btn">
                                    Mon Dossier <i className="ti-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;