import './Footer.css';

function Footer() {
  return (
    <div className='footer'>
      <footer className='textFooter'>  &copy; {new Date().getFullYear()} Sektionen för Industriell Ekonomi på LTH. Skapad av WebbI-23.
      </footer>
    </div>
  );
};

export default Footer;
