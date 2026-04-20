// ─────────────────────────────────────────────────────────────
// App.tsx — UPDATED
// Adds portal, session, login, and protected hub routes
// Replace existing src/App.tsx with this file
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu, Sparkles, LogIn, LogOut, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CONTACT_INFO } from '@/src/data/strategy';
import { BookingDialog } from '@/src/components/BookingDialog';
import { WhatsAppButton } from '@/src/components/WhatsAppButton';
import { AuthProvider, useAuth } from '@/src/components/AuthProvider';
import { ProtectedRoute } from '@/src/components/ProtectedRoute';
import { signInWithGoogle, logout } from '@/src/lib/firebase';
import ScrollToTop from '@/src/components/ScrollToTop';

// Public views
import HomePrototype from '@/src/views/HomePrototype';
import AboutPrototype from '@/src/views/AboutPrototype';
import ProgramsPrototype from '@/src/views/ProgramsPrototype';
import KidsProgramsView from '@/src/views/KidsProgramsView';
import ParentProgramsView from '@/src/views/ParentProgramsView';
import CorporateProgramsView from '@/src/views/CorporateProgramsView';

// Auth
import LoginPage from '@/src/views/LoginPage';

// Portal (client-gated)
import PortalDashboard from '@/src/views/PortalDashboard';
import PortalSessionPage from '@/src/views/PortalSessionPage';

// Hub (admin-gated)
import CoachHub from '@/src/views/CoachHub';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppShell />
      </Router>
    </AuthProvider>
  );
}

function AppShell() {
  const location = useLocation();

  // Portal and hub get minimal layout (no public nav/footer)
  const isPortal = location.pathname.startsWith('/portal');
  const isHub = location.pathname.startsWith('/hub');
  const isLogin = location.pathname === '/login';

  if (isPortal || isHub) return <PortalLayout />;
  if (isLogin) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );

  return <PublicLayout />;
}

// ─── Public Layout ────────────────────────────────────────────

function PublicLayout() {
  const { user, loading, userProfile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Programs', to: '/programs' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5A5A40] text-white transition-transform group-hover:scale-110">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-2xl font-serif font-medium tracking-tight">Nidhi Bawa</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="hover:text-[#5A5A40] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Portal link */}
                <Link to="/portal">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 text-xs hidden sm:flex">
                    My Programs
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 p-0 overflow-hidden border"
                  onClick={() => logout()}
                  title="Sign out"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full gap-2 hidden sm:flex text-sm"
                onClick={() => signInWithGoogle()}
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            )}

            <BookingDialog>
              <Button className="rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white hidden sm:flex text-sm">
                Book a Call
              </Button>
            </BookingDialog>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 pt-12">
                <nav className="flex flex-col gap-1">
                  {navLinks.map(l => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl hover:bg-[#F5F5F0] font-medium transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {user && (
                    <Link
                      to="/portal"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl hover:bg-[#F5F5F0] font-medium transition-colors text-[#5A5A40]"
                    >
                      My Programs
                    </Link>
                  )}
                  <div className="mt-4 px-4 space-y-3">
                    <BookingDialog>
                      <Button className="w-full rounded-full bg-[#5A5A40] hover:bg-[#4A4A35] text-white">
                        Book a Call
                      </Button>
                    </BookingDialog>
                    {user ? (
                      <Button variant="outline" className="w-full rounded-full" onClick={() => logout()}>
                        Sign out
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full rounded-full" onClick={() => signInWithGoogle()}>
                        Sign in with Google
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <Routes>
          <Route path="/" element={<HomePrototype />} />
          <Route path="/about" element={<AboutPrototype />} />
          <Route path="/programs" element={<ProgramsPrototype />} />
          <Route path="/kids-programs" element={<KidsProgramsView />} />
          <Route path="/parent-programs" element={<ParentProgramsView />} />
          <Route path="/corporate-programs" element={<CorporateProgramsView />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<HomePrototype />} />
        </Routes>
      </main>

      <WhatsAppButton />

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-4">
          <p>© 2026 Nidhi Bawa | Life Coach. All rights reserved.</p>
          <p className="italic">Empowering the next generation through empathy-led coaching.</p>
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-muted max-w-xs mx-auto">
            <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-[#5A5A40] transition-colors">
              {CONTACT_INFO.phone}
            </a>
            <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#5A5A40] transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Portal + Hub Layout ─────────────────────────────────────

function PortalLayout() {
  const location = useLocation();
  const isHub = location.pathname.startsWith('/hub');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Minimal nav */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#5A5A40] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif font-medium">Nidhi Bawa</span>
            <span className="text-xs text-muted-foreground border border-muted px-2 py-0.5 rounded-full ml-1">
              {isHub ? 'Coach Hub' : 'My Portal'}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full text-xs">← Website</Button>
            </Link>
            {user && (
              <Button variant="ghost" size="sm" onClick={() => logout()} className="rounded-full text-xs gap-1.5 text-muted-foreground">
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Routes>
          {/* Client Portal — requires any authenticated user */}
          <Route path="/portal" element={
            <ProtectedRoute>
              <PortalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/portal/session/:enrollmentId/:sessionNumber" element={
            <ProtectedRoute>
              <PortalSessionPage />
            </ProtectedRoute>
          } />

          {/* Coach Hub — requires admin role */}
          <Route path="/hub" element={
            <ProtectedRoute requiredRole="admin">
              <CoachHub />
            </ProtectedRoute>
          } />
          <Route path="/hub/*" element={
            <ProtectedRoute requiredRole="admin">
              <CoachHub />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}
