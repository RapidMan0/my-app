import ServiceCard from "./ServiceCard";

const Services = () => {
    const serviceList = [
        { icon: "fa-cut", title: "Haircut", description: "Professional haircuts tailored to your style." },
        { icon: "fa-paint-brush", title: "Coloring", description: "Expert hair coloring for a fresh new look." },
        { icon: "fa-spa", title: "Beard Trim", description: "Precision beard trimming and shaping." },
        { icon: "fa-magic", title: "Styling", description: "Special occasion styling for any event." },
        { icon: "fa-user-tie", title: "Mustache Grooming", description: "Expert mustache grooming for a sharp look." },
        { icon: "fa-shower", title: "Shampoo & Conditioning", description: "Relaxing shampoo and conditioning treatments." },
        { icon: "fa-head-side-mask", title: "Facial Treatments", description: "Rejuvenating facial treatments for healthy skin." },
        { icon: "fa-tint", title: "Scalp Treatments", description: "Therapeutic scalp treatments for hair health." }
    ];

    return (
        <section id="services" className="py-16" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl text-shadow font-bold text-center mb-10 text-[#ff0000] ">WHAT WE PROVIDE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {serviceList.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
