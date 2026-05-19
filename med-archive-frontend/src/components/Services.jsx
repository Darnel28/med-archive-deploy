import { useState } from "react";
import dossiermedical from "../assets/img/dossiermedical.jpeg";
import department_man from "../assets/img/gallery/department_man.png";

function Services() {
  const [activeTab, setActiveTab] = useState("dossier");

  return (
     <div className="department_area section-padding2">
            <div className="container">
              
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-tittle text-center mb-100">
                            <span>Fonctionnalités Clés</span>
                            <h2>Découvrez vos Services </h2>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="depart_ment_tab mb-30">
                          
                            <ul className="nav" id="myTab" role="tablist">
                                <li className="nav-item">
                                    <a className="nav-link active" id="home-tab" data-toggle="tab" href="#Dossier"
                                        role="tab" aria-controls="home" aria-selected="true">
                                        <i className="flaticon-find"></i>
                                        <h4>Dossier Médical</h4>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab"
                                        aria-controls="profile" aria-selected="false">
                                        <i className="flaticon-cardiovascular"></i>
                                        <h4>Profil Vital</h4>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" id="contact-tab" data-toggle="tab" href="#Resultats" role="tab"
                                        aria-controls="contact" aria-selected="false">
                                        <i className="flaticon-cell"></i>
                                        <h4>Résultats Analyses</h4>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" id="Astrology-tab" data-toggle="tab" href="#Gestion" role="tab"
                                        aria-controls="contact" aria-selected="false">
                                        <i className="flaticon-doctor"></i>
                                        <h4>Gestion Accès</h4>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" id="Neuroanatomy-tab" data-toggle="tab" href="#carnet"
                                        role="tab" aria-controls="contact" aria-selected="false">
                                        <i className="flaticon-verified"></i>
                                        <h4>Carnet Vaccinal</h4>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" id="Blood-tab" data-toggle="tab" href="#ordannce" role="tab"
                                        aria-controls="contact" aria-selected="false">
                                        <i className="flaticon-customer-service"></i>
                                        <h4>Ordonnances </h4>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="dept_main_info white-bg">
                    <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="Dossier" role="tabpanel" aria-labelledby="home-tab">
                           
                            <div className="row align-items-center no-gutters">
                                <div className="col-lg-7">
                                    <div className="dept_info">
                                        <h3>Votre dossier medical Med-Archive, centralise et toujours accessible</h3>
                                        <p>Retrouvez en un seul espace vos consultations, analyses, ordonnances et
                                            antecedents medicaux. Avec Med-Archive, vos informations de sante restent
                                            securisees, partageables avec les professionnels autorises et disponibles
                                            rapidement en cas de besoin.</p>
                                        <a href="#" className="dep-btn">Voir Plus<i className="ti-arrow-right"></i></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="dept_thumb">
                                        <img src={dossiermedical} alt="Dossier Medical"/>
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                        <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        
                            <div className="row align-items-center no-gutters">
                                <div className="col-lg-7">
                                    <div className="dept_info">
                                        <h3>Votre dossier medical Med-Archive, centralise et toujours accessible</h3>
                                        <p>Retrouvez en un seul espace vos consultations, analyses, ordonnances et
                                            antecedents medicaux. Avec Med-Archive, vos informations de sante restent
                                            securisees, partageables avec les professionnels autorises et disponibles
                                            rapidement en cas de besoin.</p>
                                        <a href="#" className="dep-btn">Voir Plus<i className="ti-arrow-right"></i></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="dept_thumb">
                                        <img src={department_man} alt="Department Man"/>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        <div className="tab-pane fade" id="Resultats" role="tabpanel" aria-labelledby="contact-tab">
                            
                            <div className="row align-items-center no-gutters">
                                <div className="col-lg-7">
                                    <div className="dept_info">
                                        <h3>Votre dossier medical Med-Archive, centralise et toujours accessible</h3>
                                        <p>Retrouvez en un seul espace vos consultations, analyses, ordonnances et
                                            antecedents medicaux. Avec Med-Archive, vos informations de sante restent
                                            securisees, partageables avec les professionnels autorises et disponibles
                                            rapidement en cas de besoin.</p>
                                        <a href="#" className="dep-btn">Voir Plus<i className="ti-arrow-right"></i></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="dept_thumb">
                                        <img src={department_man} alt="Department Man"/>
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                        <div className="tab-pane fade" id="Gestion" role="tabpanel" aria-labelledby="Gestion-tab">
                      
                            <div className="row align-items-center no-gutters">
                                <div className="col-lg-7">
                                    <div className="dept_info">
                                        <h3>Votre dossier medical Med-Archive, centralise et toujours accessible</h3>
                                        <p>Retrouvez en un seul espace vos consultations, analyses, ordonnances et
                                            antecedents medicaux. Avec Med-Archive, vos informations de sante restent
                                            securisees, partageables avec les professionnels autorises et disponibles
                                            rapidement en cas de besoin.</p>
                                        <a href="#" className="dep-btn">Voir Plus<i className="ti-arrow-right"></i></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="dept_thumb">
                                        <img src={department_man} alt="Department Man"/>
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                        <div className="tab-pane fade" id="carnet" role="tabpanel" aria-labelledby="Neuroanatomy-tab">
                        
                            <div className="row align-items-center no-gutters">
                                <div className="col-lg-7">
                                    <div className="dept_info">
                                        <h3>Votre dossier medical Med-Archive, centralise et toujours accessible</h3>
                                        <p>Retrouvez en un seul espace vos consultations, analyses, ordonnances et
                                            antecedents medicaux. Avec Med-Archive, vos informations de sante restent
                                            securisees, partageables avec les professionnels autorises et disponibles
                                            rapidement en cas de besoin.</p>
                                        <a href="#" className="dep-btn">Voir Plus<i className="ti-arrow-right"></i></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="dept_thumb">
                                        <img src={department_man} alt="Department Man"/>
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                        <div className="tab-pane fade" id="ordance" role="tabpanel" aria-labelledby="Blood-tab">
                            
                            <div className="row align-items-center no-gutters">
                                <div className="col-lg-7">
                                    <div className="dept_info">
                                        <h3>Votre dossier medical Med-Archive, centralise et toujours accessible</h3>
                                        <p>Retrouvez en un seul espace vos consultations, analyses, ordonnances et
                                            antecedents medicaux. Avec Med-Archive, vos informations de sante restent
                                            securisees, partageables avec les professionnels autorises et disponibles
                                            rapidement en cas de besoin.</p>
                                        <a href="#" className="dep-btn">Voir Plus<i className="ti-arrow-right"></i></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <div className="dept_thumb">
                                        <img src={department_man} alt="Department Man"/>
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

export default Services;