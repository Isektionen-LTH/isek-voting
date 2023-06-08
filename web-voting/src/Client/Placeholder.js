import './Placeholder.css';
import image from '../logo.png';

function Placeholder() {
  return (
    <div className='main'>
      <h1 className='text'>ISEK voting client, coming soon...</h1>
      <img src={image} alt="ISEK" className='logo' />
    </div>
  );
}

export default Placeholder;
