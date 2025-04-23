'use client';

import { useEffect, useState } from 'react';

const About = () => {
    const galleryImages = [
        './salon1.png',
        './salon5.jpg',
        './image.jpg',
        'salon3.jpg',
        'salon4.jpg',
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Автослайд
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
        }, 5000); // смена каждые 5 секунд

        return () => clearInterval(interval); // очистка при размонтировании
    }, [galleryImages.length]);

    return (
        <section
            id="about"
            className="py-16 bg-[#2a2a2a]"
            style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-28 px-4">
                <div className="grid gap-4 w-full md:w-1/2">
                    <div>
                        <img
                            className="h-auto w-full max-w-full rounded-lg object-cover object-center md:h-[480px] transition duration-500"
                            src={galleryImages[currentIndex]}
                            alt="Main salon view"
                        />
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                        {galleryImages.map((img, index) => (
                            <div key={index}>
                                <img
                                    src={img}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`object-cover object-center h-20 max-w-full rounded-lg cursor-pointer transition hover:opacity-75 ${
                                        index === currentIndex ? 'ring-4 ring-red-500' : ''
                                    }`}
                                    alt={`Gallery image ${index + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                    <h2 className="text-4xl font-bold text-white">About Us</h2>
                    <p className="text-white text-lg">
                        Welcome to SharpMen, where elegance meets style. Our team of professional stylists is dedicated to providing you with the best hair care experience. We believe that a great hairstyle can boost your confidence and make you feel amazing.
                    </p>
                    <p className="text-white text-lg">
                        Founded by Patrick Potter, our salon has been a cornerstone of the community for over a decade. We offer a wide range of services, from haircuts and coloring to special occasion styling. Our mission is to make every client feel special and leave our salon looking and feeling their best.
                    </p>
                    <a
                        href="#services"
                        className="text-lg inline-block mt-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </section>
    );
};

export default About;
