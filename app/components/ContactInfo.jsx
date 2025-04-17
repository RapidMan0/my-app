const ContactInfo = () => (
    <section id="contact-info" className="py-12" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-[#2a2a2a] p-6 rounded-lg transform transition-transform duration-300 hover:scale-105">
                <i className="fas fa-phone-alt text-red-500 text-3xl mb-2"></i>
                <h3 className="text-gray-100 text-xl font-bold mb-1">Phone</h3>
                <p className="text-gray-100">+1 (234) 567-890</p>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow transform transition-transform duration-300 hover:scale-105">
                <i className="fas fa-map-marker-alt text-red-500 text-3xl mb-2"></i>
                <h3 className="text-gray-100 text-xl font-bold mb-1">Address</h3>
                <p className="text-gray-100">123 Barber St, Hairtown, HT 12345</p>
            </div>
            <div className="bg-[#2a2a2a] p-6 rounded-lg shadow transform transition-transform duration-300 hover:scale-105">
                <i className="fas fa-clock text-red-500 text-3xl mb-2"></i>
                <h3 className="text-gray-100 text-xl font-bold mb-1">Hours</h3>
                <p className="text-gray-100">Mon-Fri: 9am - 8pm</p>
                <p className="text-gray-100">Sat-Sun: 10am - 6pm</p>
            </div>
        </div>
    </section>
);

export default ContactInfo;