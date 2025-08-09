import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = React.useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token not found');
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(result.message || 'Verification failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed');
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      {status === 'pending' && <p>Verifying...</p>}
      {status === 'success' && <p className="text-green-600">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  );
}
