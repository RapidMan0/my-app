const About = () => (
    <section id="about" className="py-16 bg-[#1a1a1a]" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-28 px-4">
            <div className="relative w-full md:w-1/2">
                <img src="./2ef725d9-03e6-40cf-9b7a-19563f649d3d.jpg" alt="About" className="rounded-xl shadow-lg" />
                <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded shadow-md text-3xl font-bold">
                    25 YEARS EXPERIENCE
                </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
                <h2 className="text-4xl font-bold text-white">About Us</h2>
                <p className="text-white text-lg">Welcome to SharpMen, where elegance meets style. Our team of professional stylists is dedicated to providing you with the best hair care experience. We believe that a great hairstyle can boost your confidence and make you feel amazing.</p>
                <p className="text-white text-lg">Founded by Patrick Potter, our salon has been a cornerstone of the community for over a decade. We offer a wide range of services, from haircuts and coloring to special occasion styling. Our mission is to make every client feel special and leave our salon looking and feeling their best.</p>
                <a href="#services" className="text-lg inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
                    Learn More
                </a>
            </div>
        </div>
    </section>
);

export default About;