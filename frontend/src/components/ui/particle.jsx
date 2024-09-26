import React, { useEffect } from 'react';

const ParticleBackground = () => {
  useEffect(() => {
    particlesJS.load('particles-js', '../../../particlesjs-config.json', function() {
      console.log('particles.js loaded - callback');
    });
  }, []);

  return <div id="particles-js" className='fixed inset-0 w-full h-full z-[-1]' />;
};

export default ParticleBackground;
