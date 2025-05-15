const Footer = () => {
    return (
        <footer className="bg-[#1f1f1f] text-gray-400 text-sm border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between">
                <a href="#home" className="text-white text-base font-semibold hover:text-gray-300 transition-colors">
                    SharpMen
                </a>
                <ul className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-0 sm:px-16 w-full sm:w-auto items-center text-center ">
                    <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="#gallery" className="hover:text-white transition-colors">Gallery</a></li>
                    <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                    <li><a href="#pricing-tabs" className="hover:text-white transition-colors">Pricing</a></li>
                    <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
            </div>
            <div className="text-center text-xs text-gray-500 py-2 border-t border-gray-700">
                © {new Date().getFullYear()} <a href="#home" className="hover:underline">SharpMen™</a>. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;