const Home = () => (
    <section
        id="home"
        className="bg-cover bg-center h-screen flex items-center justify-start text-white text-left"
        style={{
            backgroundImage: 'url(/retro-clothes-barbershop-stylish.2e16d0ba.fill-1920x1080.jpg)',
            backgroundAttachment: 'fixed', // Параллакс-эффект
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            textShadow: '2px 4px 15px rgba(0, 0, 0, 1)',
        }}
    >
        <div className=" p-8 rounded-lg space-y-3 mt-6 ml-4 sm:ml-6 md:ml-10 lg:ml-16 xl:ml-20">
            <h1 className="text-5xl md:text-6xl font-bold">Sharp Men</h1>
            <p className="text-lg">BECOME A MEMBER</p>
            <p className="text-lg">WITH PATRICK POTTER</p>
            <p className="text-lg">OUR HAIRSTYLES MAKE YOU</p>
            <p className="text-xl">LOOK ELEGANT</p>
            <p className="text-xl">GET MORE CONFIDENCE</p>
        </div>
    </section>
);

export default Home;