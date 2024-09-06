import { Link } from 'react-router-dom';
import '../../../styles/signuptitle.css';

function LoginTitle() {
  return (
    <div className='titlecontainer'>
      <h3 className='title'>Sign in to your dashboard</h3>
      <p className='link'>
        Need to create account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

export default LoginTitle;
