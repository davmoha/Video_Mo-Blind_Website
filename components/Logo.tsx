/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoImg from '../assets/logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText }) => {
  // Size mapping for standard width and height classes
  const dims = {
    sm: 'w-20 h-14 md:w-24 md:h-16',
    md: 'w-28 h-20 md:w-36 md:h-24',
    lg: 'w-40 h-28 md:w-48 md:h-32',
    xl: 'w-56 h-36 md:w-64 md:h-44'
  }[size];

  return (
    <div className={`flex items-center justify-center select-none ${dims} ${className}`}>
      <img
        src={logoImg}
        alt="Mo-Blind Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;
