import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import RegisterForm from '@/components/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Join Us Today 🍽️"
      description="Create your account and explore delicious meals from verified vendors."
      image="/images/register-illustration.png" // Or use /logo.png for now
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;