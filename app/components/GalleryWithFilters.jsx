"use client";

import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const GalleryWithFilters = () => {
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

    const tags = ["All", "Beard", "Haircut", "Redhead", "Blonde", "Dark"];

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch(
                    "https://api.jsonbin.io/v3/b/6824b8128960c979a5996cfa/latest",
                    {
                        headers: {
                            "X-Master-Key": "$2a$10$FYW4gMZluUaf9SDRGEpXW.yZSQrB48u7PMzUJuXMBJQCg2POFP686",
                        },
                    }
                );
                const json = await response.json();
                setImages(json.record.images);
                setFilteredImages(json.record.images); // Изначально показываем все изображения
                setIsLoading(false); // Отключаем состояние загрузки
            } catch (error) {
                console.error("Error fetching images:", error);
                setIsLoading(false); // Отключаем состояние загрузки даже при ошибке
            }
        };

        fetchImages();
    }, []);

    const handleFilter = (tag) => {
        if (tag === "All") {
            setFilteredImages(images);
            setSelectedTags([]);
        } else {
            setFilteredImages(images.filter((image) => image.tags.includes(tag)));
            setSelectedTags([tag]);
        }
    };

    return (
        <section id="gallery" className="pt-12" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" }}>
            <h2 className="text-3xl text-shadow font-bold text-center mb-10 text-red-500">OUR GALLERY</h2>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                {/* Фильтры */}
                <div className="w-full md:w-1/6">
                    <h2 className="text-3xl font-bold text-red-500 mb-4">Filter by:</h2>
                    <div className="flex flex-col gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleFilter(tag)}
                                className={`py-2 rounded border w-40 ${selectedTags.includes(tag)
                                    ? "bg-red-500 text-white"
                                    : "bg-[#2a2a2a] border-gray-600 text-white"
                                    } hover:bg-red-500 hover:text-white transition`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Галерея */}
                <div className="w-full md:w-3/4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="w-full aspect-square overflow-hidden rounded-lg bg-gray-200 animate-pulse"
                            >
                                <Skeleton
                                    className="w-full h-full"
                                    baseColor="#e0e0e0"
                                    highlightColor="#f5f5f5"
                                />
                            </div>
                        ))
                        : filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="relative w-full aspect-square overflow-hidden rounded-lg group"
                            >
                                <img
                                    className="w-full h-full object-cover"
                                    src={image.src}
                                />
                                {/* Теги */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out flex flex-wrap justify-center gap-2 p-2">
                                    {image.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-full shadow"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </section>
    );
};

export default GalleryWithFilters;