import { useAuth } from '@/hooks/useAuth';
import { ProPlanUpgrade } from '@/components/pro-plan-upgrade';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function UpgradePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-gray-900 to-navy">
      <ProPlanUpgrade onSuccess={() => navigate('/')} />
    </div>
  );
}
