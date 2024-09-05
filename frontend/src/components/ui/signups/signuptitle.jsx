import { Link } from 'react-router-dom';
import '../../../styles/signuptitle.css';

function SignupTitle() {
  return (
    <div className='titlecontainer'>
      <h3 className='title'>Create an account</h3>
      <p className='link'>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default SignupTitle;
