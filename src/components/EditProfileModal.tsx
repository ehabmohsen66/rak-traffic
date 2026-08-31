'use client';

import React, { useState } from 'react';
import type { User } from '@/lib/types';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Check, 
  Mail, 
  Briefcase, 
  User as UserIcon, 
  Loader2, 
  Sparkles 
} from 'lucide-react';

interface EditProfileModalProps {
  store: TrafficStore;
  state: AppState;
  user: User;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  store,
  state,
  user,
  onClose,
}) => {
  const t = translations[state.language];
  const isRtl = state.language === 'ar';

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [department, setDepartment] = useState(user.department);
  const [avatar, setAvatar] = useState(user.avatar);
  const [avatarMode, setAvatarMode] = useState<'upload' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(state.language === 'ar' ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 180; // 180x180 high quality square avatar
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            setAvatar(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            setAvatar(reader.result as string);
          }
        };
        img.src = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      await store.updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        department: department.trim(),
        avatar: avatar.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {state.language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Team Member Profile'}
              </h3>
              <p className="text-xs text-slate-500">
                {state.language === 'ar' 
                  ? 'يتم حفظ التغييرات على الخادم ومشاركتها مع جميع أعضاء الفريق'
                  : 'Changes are saved to the server and synced across all team devices'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {state.language === 'ar' ? 'تم تحديث الملف الشخصي ومزامنته بنجاح!' : 'Profile successfully updated and synced with server!'}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Avatar Section */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              {state.language === 'ar' ? 'الصورة الشخصية' : 'Profile Photo'}
            </label>
            
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatarMode('upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      avatarMode === 'upload' 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {state.language === 'ar' ? 'تحميل صورة' : 'Upload File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode('url')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      avatarMode === 'url' 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {state.language === 'ar' ? 'رابط مباشر' : 'Image URL'}
                  </button>
                </div>

                {avatarMode === 'upload' ? (
                  <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold cursor-pointer shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{state.language === 'ar' ? 'اختر صورة من جهازك' : 'Choose image from device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      {state.language === 'ar' ? 'تطبيق' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{state.language === 'ar' ? 'الاسم الكامل' : 'Full Name'}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{state.language === 'ar' ? 'البريد الإلكتروني للإشعارات' : 'Notification Email Address'}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@rak4digital.com"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Department / Position */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{state.language === 'ar' ? 'القسم أو المنصب' : 'Department / Title'}</span>
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Lead Graphic Designer"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{state.language === 'ar' ? 'جاري الحفظ...' : 'Saving to server...'}</span>
                </>
              ) : (
                <span>{t.save}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
