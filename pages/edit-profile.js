import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

function BackIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function CameraIcon() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
}
function CheckIcon() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function LoadingSpinner() {
  return (<svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>);
}

const INPUT = "w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 px-4 text-sm text-white placeholder-zinc-600 focus:border-red-600/60 transition-all outline-none";

export default function EditProfile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Load existing profile data
  useEffect(() => {
    if (!loading && !user) { router.replace('/'); return; }
    if (!user) return;

    setName(user.displayName || '');

    // Load extra fields from Firestore
    const ref = doc(db, 'users', user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPhone(data.phone || '');
        setLocation(data.location || 'Bangalore, IN');
        setBio(data.bio || '');
      } else {
        setLocation('Bangalore, IN');
      }
    }).catch(() => {});
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setSaved(false);

    try {
      // Update Firebase Auth displayName
      if (name.trim() !== (user.displayName || '')) {
        await updateProfile(user, { displayName: name.trim() });
      }

      // Save extra fields to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

  return (
    <>
      <Head><title>Edit Profile — Sneakout</title></Head>

      <div className="min-h-screen bg-[#09090B] max-w-lg mx-auto px-4 pb-16 anim-page">
        <div className="h-14" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 pressable">
            <BackIcon />
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Edit Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-8 anim-fade-up">
          <div className="relative">
            {user.photoURL ? (
              <img src={user.photoURL} alt={name} className="w-24 h-24 rounded-3xl object-cover border-2 border-zinc-700" />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-red-900/30">
                {initials}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-900/40 border-2 border-[#09090B] pressable">
              <CameraIcon />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5 anim-fade-up" style={{ animationDelay: '0.05s' }}>
          {/* Name */}
          <div>
            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-2 block px-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={INPUT}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-2 block px-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className={INPUT}
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-2 block px-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bangalore, IN"
              className={INPUT}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-2 block px-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className={INPUT + " resize-none"}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="mt-5 anim-fade-up" style={{ animationDelay: '0.1s' }}>
          <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-widest mb-2 block px-1">Email</label>
          <div className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-3.5 px-4 text-sm text-zinc-600">
            {user.email}
          </div>
          <p className="text-zinc-700 text-[11px] mt-1.5 px-1">Email can&apos;t be changed — linked to your Google account</p>
        </div>

        {/* Save button */}
        <div className="mt-8 anim-fade-up" style={{ animationDelay: '0.15s' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 pressable transition-all bg-red-600 text-white disabled:opacity-60"
          >
            {saving ? (
              <><LoadingSpinner /> Saving...</>
            ) : saved ? (
              <><CheckIcon /> Saved!</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-zinc-700 text-xs">Changes are saved to your Sneakout account</p>
        </div>
      </div>
    </>
  );
}
