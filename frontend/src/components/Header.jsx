import { Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useUserProfile } from "../context/UserProfileContext";

const Header = () => {
  const [profilesOpen, setProfilesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profilesRef = useRef(null);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = UserAuth();
  const { profileData } = useUserProfile();
  const { resolvedTheme, toggleTheme } = useTheme();

  const userInitial = useMemo(() => {
    if (!profileData?.name) return "U";
    return profileData.name.charAt(0).toUpperCase();
  }, [profileData?.name]);

  const platforms = [
    { id: "leetcode", name: "LeetCode", connected: !!profileData?.leetcode_username },
    { id: "codeforces", name: "Codeforces", connected: !!profileData?.codeforces_username },
    { id: "codechef", name: "CodeChef", connected: !!profileData?.codechef_username },
  ];

  useEffect(() => {
    const onClickOutside = (event) => {
      if (profilesRef.current && !profilesRef.current.contains(event.target)) {
        setProfilesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("touchstart", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, []);

  useEffect(() => {
    setProfilesOpen(false);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUserMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-muted)] bg-[var(--header-bg)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-color)]">
            {"</>"}
          </span>
          <div>
            <p className="text-lg font-semibold tracking-wide text-[var(--text-primary)]">Unicode</p>
            <p className="text-xs text-[var(--text-muted)]">Competitive Programming Tracker</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/dashboard"
            className={`text-sm font-medium transition ${
              isActive("/dashboard")
                ? "text-[var(--brand-color)]"
                : "text-[var(--text-primary)] hover:text-[var(--brand-color)]"
            }`}
          >
            Dashboard
          </Link>

          <div className="relative" ref={profilesRef}>
            <button
              type="button"
              className={`text-sm font-medium transition ${
                isActive("/leetcode") || isActive("/codeforces") || isActive("/codechef")
                  ? "text-[var(--brand-color)]"
                  : "text-[var(--text-primary)] hover:text-[var(--brand-color)]"
              }`}
              onClick={() => setProfilesOpen((prev) => !prev)}
              aria-expanded={profilesOpen}
              aria-haspopup="menu"
            >
              Coding Profiles
            </button>
            {profilesOpen && (
              <div className="absolute left-0 mt-3 w-64 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-2 shadow-xl">
                {platforms.map((platform) => (
                  <Link
                    key={platform.id}
                    to={`/${platform.id}`}
                    onClick={() => setProfilesOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)]"
                  >
                    <span>{platform.name}</span>
                    <span className={`text-xs ${platform.connected ? "text-emerald-500" : "text-rose-500"}`}>
                      {platform.connected ? "Connected" : "Not connected"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/contest"
            className={`text-sm font-medium transition ${
              isActive("/contest")
                ? "text-[var(--brand-color)]"
                : "text-[var(--text-primary)] hover:text-[var(--brand-color)]"
            }`}
          >
            Contests
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-muted)] bg-[var(--surface-muted)] text-[var(--text-primary)] transition hover:border-[var(--brand-color)]"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-color)] text-sm font-semibold text-white"
              aria-label="Open user menu"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              {userInitial}
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-44 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-strong)] p-1.5 shadow-xl">
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-[var(--surface-muted)]"
                >
                  Edit Profile
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-500 transition hover:bg-[var(--surface-muted)]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg border border-[var(--border-muted)] px-3 py-1.5 text-sm text-[var(--text-primary)] md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--border-muted)] bg-[var(--surface)] md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            >
              Dashboard
            </Link>
            <Link
              to="/contest"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
            >
              Contests
            </Link>
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                to={`/${platform.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              >
                <span>{platform.name}</span>
                <span className={`text-xs ${platform.connected ? "text-emerald-500" : "text-rose-500"}`}>
                  {platform.connected ? "Connected" : "Not connected"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
