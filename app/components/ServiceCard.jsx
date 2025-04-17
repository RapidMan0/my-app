const ServiceCard = ({ icon, title, description }) => (
    <div className="bg-[#2a2a2a] p-6 rounded-lg transform transition-transform duration-300 hover:scale-105 text-center">
        <i className={`fas ${icon} text-red-500 text-3xl mb-4`}></i>
        <h3 className="text-2xl text-white font-bold mb-2">{title}</h3>
        <p className="text-white">{description}</p>
    </div>
);

export default ServiceCard;
