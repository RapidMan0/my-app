const ServiceCard = ({ icon, title, description }) => (
    <div className="bg-[#2a2a2a] p-6 rounded-lg shadow transform transition-transform duration-300 hover:scale-105 text-center flex flex-col items-center">
        <div className="text-red-500 text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
    </div>
);

export default ServiceCard;