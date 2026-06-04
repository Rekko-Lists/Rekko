import { useState, useEffect } from 'react';
import { Edit, Lock, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/common/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/lib/authService';
import type { SocialLink } from '@/lib/authService';
import { extractApiError } from '@/lib/apiErrors';
import { logger } from '@/lib/logger';
import ImageUploadModal from '@/components/ui/profile/ImageUploadModal';
import Seo from '@/components/seo/Seo';
import { seoPages } from '@/components/seo/pages';

const PLATFORMS = ['twitter', 'instagram', 'github', 'youtube', 'twitch', 'linkedin', 'discord', 'tiktok'];

const styles = {
  page:        'flex font-gabarito min-h-full',
  sidebar:     'w-[230px] flex-shrink-0 border-r-[1.5px] border-border py-8 px-6 flex flex-col gap-4',
  sideItem:    'flex items-center gap-2 text-sm cursor-pointer text-text-secondary hover:text-text-main transition-colors',
  sideActive:  'flex items-center gap-2 text-sm cursor-pointer text-text-main font-semibold',
  content:     'flex-1 px-10 py-8 flex gap-10',
  mainCol:     'flex-1 flex flex-col gap-8 min-w-0',
  section:     'flex flex-col gap-4',
  sectionHead: 'text-[28px] font-semibold text-text-main border-b-2 border-primary pb-1 w-fit',
  label:       'text-sm font-semibold text-text-main',
  sublabel:    'text-xs text-text-muted',
  input:       'w-[153px] h-[32px] border border-border rounded-[5px] px-3 text-sm text-text-main bg-surface focus:outline-none focus:border-text-secondary',
  inputMd:     'w-[260px] h-[32px] border border-border rounded-[5px] px-3 text-sm text-text-main bg-surface focus:outline-none focus:border-text-secondary',
  textarea:    'w-[243px] h-[110px] border border-border rounded-[5px] px-3 py-2 text-sm text-text-main bg-surface resize-none focus:outline-none focus:border-text-secondary placeholder:text-text-muted',
  linkInput:   'flex-1 h-[28px] border border-border rounded-[5px] px-3 text-sm text-text-main bg-surface focus:outline-none',
  selectSmall: 'h-[28px] border border-border rounded-[5px] px-2 text-sm text-text-main bg-surface focus:outline-none capitalize',
  addLink:     'text-sm text-primary cursor-pointer hover:underline',
  secRow:      'border border-border rounded-[5px] px-4 py-3 flex items-center justify-between text-sm text-text-main',
  changeBtn:   'text-sm text-primary cursor-pointer hover:underline',
  avatarCol:   'flex flex-col items-center gap-3',
  avatarCirc:  'w-[174px] h-[174px] rounded-full bg-border-light overflow-hidden',
  editBtn:     'flex items-center gap-1 text-sm cursor-pointer text-text-secondary hover:text-primary transition-colors border border-border rounded-[5px] px-3 py-1',
  feedback:    'text-xs mt-1',
  ok:          'text-status-green',
  err:         'text-status-red',
};

type Section = 'general' | 'security';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const [section, setSection] = useState<Section>('general');

  // Username change
  const [newUsername, setNewUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [usernameOpen, setUsernameOpen] = useState(false);

  // Bio
  const [bio, setBio] = useState('');
  const [bioMsg, setBioMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Social links
  const [links, setLinks] = useState<SocialLink[]>([{ name: '', url: '' }]);
  const [linksMsg, setLinksMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  // Email verification
  const [verifyMsg, setVerifyMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Password reset
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Profile image upload modal
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Load current profile data on mount
  useEffect(() => {
    if (!user) return;
    authService.getUserProfile(user.username)
      .then(data => {
        setBio(data.biography ?? '');
        const accounts = data.socialAccounts ?? data.userSocialAccount;
        if (accounts?.length) {
          setLinks(accounts.map(sa => ({ name: sa.socialAccount.name, url: sa.socialUrl })));
        }
        // Refresh emailVerified and profileImage from the server
        setUser({ ...user, emailVerified: data.emailVerified, profileImage: data.profileImage ?? user.profileImage });
        logger.info('Settings: profile loaded', data);
      })
      .catch(err => logger.error('Settings: failed to load profile', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangeUsername() {
    if (!user || !newUsername.trim()) return;
    try {
      await authService.changeUsername(user.username, user.email, newUsername.trim());
      setUser({ ...user, username: newUsername.trim() });
      setUsernameMsg({ text: 'Username updated!', ok: true });
      setUsernameOpen(false);
      setNewUsername('');
    } catch (err: unknown) {
      setUsernameMsg({ text: extractApiError(err, 'Failed to update username.'), ok: false });
    }
  }

  async function handleSaveBio() {
    if (!user) return;
    try {
      await authService.updateProfile(user.username, { biography: bio });
      setBioMsg({ text: 'Bio saved!', ok: true });
    } catch (err: unknown) {
      setBioMsg({ text: extractApiError(err, 'Failed to save bio.'), ok: false });
    }
  }

  async function handleSaveLinks() {
    if (!user) return;
    const validLinks = links.filter(l => l.name && l.url.trim());
    try {
      await authService.updateSocialAccounts(user.username, validLinks);
      setLinksMsg({ text: 'Social links saved!', ok: true });
    } catch (err: unknown) {
      setLinksMsg({ text: extractApiError(err, 'Failed to save links.'), ok: false });
    }
  }

  async function handleChangeEmail() {
    if (!user || !newEmail.trim()) return;
    try {
      await authService.changeEmail(user.username, newEmail.trim());
      setEmailMsg({ text: 'Confirmation email sent to your current address.', ok: true });
      setEmailOpen(false);
      setNewEmail('');
    } catch (err: unknown) {
      setEmailMsg({ text: extractApiError(err, 'Failed to request email change.'), ok: false });
    }
  }

  async function handleForgotPassword() {
    if (!user) return;
    try {
      await authService.forgotPassword(user.username);
      setPasswordMsg({ text: 'Password reset email sent to your email address.', ok: true });
    } catch {
      setPasswordMsg({ text: 'Failed to send reset email. Please try again.', ok: false });
    }
  }

  async function handleVerifyEmail() {
    if (!user) return;
    try {
      await authService.requestEmailVerification(user.username);
      setVerifyMsg({ text: 'Verification email sent! Check your inbox.', ok: true });
    } catch (err: unknown) {
      setVerifyMsg({ text: extractApiError(err, 'Failed to send verification email.'), ok: false });
    }
  }

  return (
    <div className={styles.page}>
      <Seo
        title={seoPages.settings.title}
        description={seoPages.settings.description}
        canonicalPath={seoPages.settings.path}
        noindex={seoPages.settings.noindex}
      />
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <button className={section === 'general' ? styles.sideActive : styles.sideItem} onClick={() => setSection('general')}>
          <SettingsIcon size={18} /> General Settings
        </button>
        <button className={section === 'security' ? styles.sideActive : styles.sideItem} onClick={() => setSection('security')}>
          <Lock size={18} /> Security & Login
        </button>
      </aside>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.mainCol}>

          {section === 'general' && (
            <>
              {/* Account section */}
              <div className={styles.section}>
                <h2 className={styles.sectionHead}>Account</h2>

                {/* Username */}
                <div className="flex flex-col gap-1">
                  <span className={styles.label}>Change Username</span>
                  <span className={styles.sublabel}>Current: @{user?.username}</span>
                  {usernameOpen ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        className={styles.input}
                        placeholder="New username"
                        value={newUsername}
                        onChange={e => { setNewUsername(e.target.value); setUsernameMsg(null); }}
                      />
                      <Button variant="amber" onClick={handleChangeUsername}>Save</Button>
                      <button className="text-xs text-text-muted hover:text-text-main" onClick={() => { setUsernameOpen(false); setUsernameMsg(null); }}>Cancel</button>
                    </div>
                  ) : (
                    <Button variant="amber" className="mt-1 w-fit" onClick={() => setUsernameOpen(true)}>Change Username</Button>
                  )}
                  {usernameMsg && (
                    <p className={`${styles.feedback} ${usernameMsg.ok ? styles.ok : styles.err}`}>
                      {usernameMsg.text}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-1">
                  <span className={styles.label}>Bio</span>
                  <textarea
                    className={styles.textarea}
                    placeholder="Write your personal bio"
                    value={bio}
                    onChange={e => { setBio(e.target.value); setBioMsg(null); }}
                  />
                  <Button variant="amber" className="w-fit" onClick={handleSaveBio}>Save Bio</Button>
                  {bioMsg && (
                    <p className={`${styles.feedback} ${bioMsg.ok ? styles.ok : styles.err}`}>
                      {bioMsg.text}
                    </p>
                  )}
                </div>

                {/* Social links */}
                <div className="flex flex-col gap-2">
                  <span className={styles.label}>Social links</span>
                  {links.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        className={styles.selectSmall}
                        value={l.name}
                        onChange={e => setLinks(prev => prev.map((v, j) => j === i ? { ...v, name: e.target.value } : v))}
                      >
                        <option value="">Platform</option>
                        {PLATFORMS.map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                      <input
                        className={styles.linkInput}
                        placeholder="https://..."
                        value={l.url}
                        onChange={e => setLinks(prev => prev.map((v, j) => j === i ? { ...v, url: e.target.value } : v))}
                      />
                      {links.length > 1 && (
                        <button
                          className="text-xs text-text-muted hover:text-status-red transition-colors"
                          onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-4">
                    <span className={styles.addLink} onClick={() => setLinks(prev => [...prev, { name: '', url: '' }])}>+ add</span>
                  </div>
                  <Button variant="amber" className="w-fit" onClick={handleSaveLinks}>Save Links</Button>
                  {linksMsg && (
                    <p className={`${styles.feedback} ${linksMsg.ok ? styles.ok : styles.err}`}>
                      {linksMsg.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Email verification */}
              {user && !user.emailVerified && (
                <div className={styles.section}>
                  <h2 className={styles.sectionHead}>Email Verification</h2>
                  <div className="flex items-center gap-3">
                    <XCircle size={18} className="text-status-red flex-shrink-0" />
                    <span className="text-sm text-text-main">Your email is not verified.</span>
                  </div>
                  <Button variant="amber" className="w-fit" onClick={handleVerifyEmail}>
                    Verify email address
                  </Button>
                  {verifyMsg && (
                    <p className={`${styles.feedback} ${verifyMsg.ok ? styles.ok : styles.err}`}>
                      {verifyMsg.text}
                    </p>
                  )}
                </div>
              )}
              {user?.emailVerified && (
                <div className="flex items-center gap-2 text-sm text-status-green">
                  <CheckCircle size={16} /> Email verified
                </div>
              )}
            </>
          )}

          {section === 'security' && (
            <div className={styles.section}>
              <h2 className={styles.sectionHead}>Security</h2>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <div className={styles.secRow}>
                  <span>Email — <span className="text-text-muted">{user?.email}</span></span>
                  <button className={styles.changeBtn} onClick={() => { setEmailOpen(v => !v); setEmailMsg(null); }}>
                    Change
                  </button>
                </div>
                {emailOpen && (
                  <div className="flex items-center gap-2 px-4 pb-2">
                    <input
                      className={styles.inputMd}
                      type="email"
                      placeholder="New email address"
                      value={newEmail}
                      onChange={e => { setNewEmail(e.target.value); setEmailMsg(null); }}
                    />
                    <Button variant="amber" onClick={handleChangeEmail}>Send confirmation</Button>
                  </div>
                )}
                {emailMsg && (
                  <p className={`${styles.feedback} px-4 ${emailMsg.ok ? styles.ok : styles.err}`}>
                    {emailMsg.text}
                  </p>
                )}
              </div>

              {/* Password — sends a reset email */}
              <div className={styles.secRow}>
                <span>Password</span>
                <button className={styles.changeBtn} onClick={handleForgotPassword}>
                  Send reset email
                </button>
              </div>
              {passwordMsg && (
                <p className={`${styles.feedback} px-4 ${passwordMsg.ok ? styles.ok : styles.err}`}>
                  {passwordMsg.text}
                </p>
              )}
            </div>
          )}

        </div>

        {/* Avatar col */}
        <div className={styles.avatarCol}>
          <p className="text-sm font-semibold text-text-main self-start">Profile Picture</p>
          <div className={styles.avatarCirc}>
            {user?.profileImage
              ? <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              : <span className="text-3xl font-semibold text-text-secondary">{user?.username?.[0]?.toUpperCase() ?? '?'}</span>
            }
          </div>
          <button className={styles.editBtn} onClick={() => setAvatarModalOpen(true)}>
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Profile image upload modal */}
      {avatarModalOpen && user && (
        <ImageUploadModal
          type="profile"
          username={user.username}
          onSuccess={imageUrl => setUser({ ...user, profileImage: imageUrl })}
          onClose={() => setAvatarModalOpen(false)}
        />
      )}
    </div>
  );
}
