const Header = () => (
    <header className="bg-black text-white shadow-md">
        <nav className="container mx-auto px-4 py-4">
            <ul className="flex justify-center space-x-6 font-semibold">
                {["Home", "About", "Services", "Portfolio", "Blog", "Contact"].map((item) => (
                    <li key={item}>
                        <a href={`#${item.toLowerCase()}`} className="hover:text-red-500 transition">
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    </header>
);

export default Header;
