import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordInput } from '@shared/authSchemas';

export default function ProfilePage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const [message, setMessage] = React.useState('');

  const onSubmit = async (data: ChangePasswordInput) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await res.json();
    setMessage(result.message || (result.success ? 'Password changed successfully' : 'Failed to change password'));
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Change Password</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label>Current Password</label>
          <input type="password" {...register('currentPassword')} className="input input-bordered w-full" />
          {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
        </div>
        <div className="mb-4">
          <label>New Password</label>
          <input type="password" {...register('newPassword')} className="input input-bordered w-full" />
          {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
        </div>
        <div className="mb-4">
          <label>Confirm New Password</label>
          <input type="password" {...register('confirmNewPassword')} className="input input-bordered w-full" />
          {errors.confirmNewPassword && <p className="text-red-500 text-sm">{errors.confirmNewPassword.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
