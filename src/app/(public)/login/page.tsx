import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome Back 👋"
      description="Log in to continue ordering from the best food vendors around campus."
      image="/images/login-illustration.png" // You can put any image in your public/images folder
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;