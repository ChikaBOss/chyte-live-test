const Footer = () => {
    return (
      <footer className="bg-dark text-cream text-sm py-6 px-4 sm:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Chyte. All rights reserved.</p>
  
          <div className="flex gap-4">
            <a href="/vendors" className="hover:text-olive transition">
              Vendors
            </a>
            <a href="/chefs" className="hover:text-olive transition">
              Chefs
            </a>
            <a href="/dashboard" className="hover:text-olive transition">
              Dashboard
            </a>
          </div>
        </div>
      </footer>
    );
  };
  
  export default Footer;