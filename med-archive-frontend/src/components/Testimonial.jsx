import logo from "../assets/img/logo11.png";


import Homepage_testi from "../assets/img/gallery/Homepage_testi.png";
import video from "../assets/css/Vidéo illustration.mp4";

function Testimonial() {
  return (
    <header>
     <div className="all-starups-area testimonial-area fix">
          
            <div className="starups">
           
                <div className="h1-testimonial-active">
                 
                    <div className="single-testimonial text-center">
                   
                        <div className="testimonial-caption ">
                            <div className="testimonial-top-cap">
                               
                                <p>“Dites adieu aux dossiers papiers égarés.
                                    Découvrez comment Med-Archive connecte instantanément les hôpitaux
                                    et les cliniques pour un suivi médical fluide et sécurisé.”</p>
                            </div>
                         
                            <div className="testimonial-founder d-flex align-items-center justify-content-center">
                                <div className="founder-img">
                                    <img src={Homepage_testi} alt="Founder"/>
                                </div>
                                <div className="founder-text">
                                    <span>Dr. Samuel Atchade</span>
                                    <p>Expert en Santé Numérique</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
               
            </div>
           
          
                <video className="starups-video" controls>
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
       
    </header>
  );
}

export default Testimonial;