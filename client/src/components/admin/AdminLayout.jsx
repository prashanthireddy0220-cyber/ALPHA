import React, { useState } from 'react';
import { LayoutDashboard, Users, Megaphone, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminTeams } from './AdminTeams';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminSettings } from './AdminSettings';

import { AdminControlCenter } from './AdminControlCenter';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <AdminControlCenter />
    </div>
  );
};
