import { useState } from 'react';
import { Edit, Lock, Settings as SettingsIcon, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/common/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/lib/authService';

const styles = {
  page:       'flex font-gabarito min-h-full',
  sidebar:    'w-[230px] flex-shrink-0 border-r-[1.5px] border-border py-8 px-6 flex flex-col gap-4',
  sideItem:   'flex items-center gap-2 text-sm cursor-pointer text-text-secondary hover:text-text-main transition-colors',
  sideActive: 'flex items-center gap-2 text-sm cursor-pointer text-text-main font-semibold',
  content:    'flex-1 px-10 py-8 flex gap-10',
  mainCol:    'flex-1 flex flex-col gap-8 min-w-0',
  section:    'flex flex-col gap-4',
  sectionHead:'text-[28px] font-semibold text-text-main border-b-2 border-primary pb-1 w-fit',
  label:      'text-sm font-semibold text-text-main',
  sublabel:   'text-xs text-text-muted',
  input:      'w-[153px] h-[32px] border border-border rounded-[5px] px-3 text-sm text-text-main bg-surface focus:outline-none focus:border-text-secondary',
  inputMd:    'w-[260px] h-[32px] border border-border rounded-[5px] px-3 text-sm text-text-main bg-surface focus:outline-none focus:border-text-secondary',
  textarea:   'w-[243px] h-[110px] border border-border rounded-[5px] px-3 py-2 text-sm text-text-main bg-surface resize-none focus:outline-none focus:border-text-secondary placeholder:text-text-muted',
  linkInput:  'w-[274px] h-[28px] border border-border rounded-[5px] px-3 text-sm text-text-main bg-surface focus:outline-none',
  addLink:    'text-sm text-primary cursor-pointer hover:underline',
  secRow:     'border border-border rounded-[5px] px-4 py-3 flex items-center justify-between text-sm text-text-main',
  changeBtn:  'text-sm text-primary cursor-pointer hover:underline',
  avatarCol:  'flex flex-col items-center gap-3',
  avatarCirc: 'w-[174px] h-[174px] rounded-full bg-border-light',
  editBtn:    'flex items-center gap-1 text-sm cursor-pointer text-text-secondary hover:text-primary transition-colors border border-border rounded-[5px] px-3 py-1',
  feedback:   'text-xs mt-1',
  ok:         'text-status-green',
  err:        'text-status-red',
};

type Section = 'general' | 'security';

export default function Settings() {
  const { user, setUser, accessToken } = useAuthStore();
  const [section, setSection] = useState<Section>('general');

  // Username change
  const [newUsername, setNewUsername] = useState('');
  const [usernameMsg, setUsernameMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [usernameOpen, setUsernameOpen] = useState(false);

  // Bio
  const [bio, setBio] = useState(user ? '' : '');
  const [bioMsg, setBioMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Social links
  const [links, setLinks] = useState(['', '']);

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  // Email verification
  const [verifyMsg, setVerifyMsg] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleChangeUsername() {
    if (!user || !accessToken || !newUsername.trim()) return;
    try {
      await authService.changeUsername(user.username, user.email, newUsername.trim(), accessToken);
      setUser({ ...user, username: newUsername.trim() });
      setUsernameMsg({ text: 'Username updated!', ok: true });
      setUsernameOpen(false);
      setNewUsername('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setUsernameMsg({ text: msg ?? 'Failed to update username.', ok: false });
    }
  }

  async function handleSaveBio() {
    if (!user || !accessToken) return;
    try {
      await authService.updateProfile(user.username, { biography: bio }, accessToken);
      setBioMsg({ text: 'Bio saved!', ok: true });
    } catch {
      setBioMsg({ text: 'Failed to save bio.', ok: false });
    }
  }

  async function handleChangeEmail() {
    if (!user || !accessToken || !newEmail.trim()) return;
    try {
      await authService.changeEmail(user.username, newEmail.trim(), accessToken);
      setEmailMsg({ text: 'Confirmation email sent to your current address.', ok: true });
      setEmailOpen(false);
      setNewEmail('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setEmailMsg({ text: msg ?? 'Failed to request email change.', ok: false });
    }
  }

  async function handleVerifyEmail() {
    if (!user || !accessToken) return;
    try {
      await authService.requestEmailVerification(user.username, accessToken);
      setVerifyMsg({ text: 'Verification email sent! Check your inbox.', ok: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setVerifyMsg({ text: msg ?? 'Failed to send verification email.', ok: false });
    }
  }

  return (
    <div className={styles.page}>
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
                    <input
                      key={i}
                      className={styles.linkInput}
                      placeholder="https://example.com/example"
                      value={l}
                      onChange={e => setLinks(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                    />
                  ))}
                  <span className={styles.addLink} onClick={() => setLinks(prev => [...prev, ''])}>+ add</span>
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

              {/* Password */}
              <div className={styles.secRow}>
                <span>Password</span>
                <span className={styles.changeBtn}>Change</span>
              </div>
            </div>
          )}

        </div>

        {/* Avatar col */}
        <div className={styles.avatarCol}>
          <p className="text-sm font-semibold text-text-main self-start">Profile Picture</p>
          <div className={styles.avatarCirc} />
          <button className={styles.editBtn}>
            <Edit size={14} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}
