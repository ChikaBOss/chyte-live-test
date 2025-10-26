'use client';

import React from 'react';
import Image from 'next/image';

const AuthLayout = ({ children, title, description, image }: {
  children: React.ReactNode;
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="bg-dark text-cream flex flex-col justify-center items-center p-10 text-center">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-lg">{description}</p>
        <div className="mt-8 w-60 h-60 relative">
          <Image src={image} alt="auth-illustration" fill className="object-contain" />
        </div>
      </div>
      <div className="bg-cream text-dark flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;