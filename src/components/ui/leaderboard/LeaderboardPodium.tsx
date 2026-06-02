import { Crown, Medal } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui/common/Avatar";
import type { ReputationUser } from "@/lib/userService";

interface Props {
  users: ReputationUser[];
}

const rankStyles = {
  1: {
    color: "text-[#D99A00]",
    glow: "shadow-[0_18px_40px_rgba(255,158,0,0.28)]",
    height: "h-[230px]",
    lift: "-translate-y-8",
    icon: <Crown size={32} fill="#FFB21A" className="text-[#D99A00] drop-shadow" />,
  },
  2: {
    color: "text-[#8B95A6]",
    glow: "shadow-[0_14px_30px_rgba(120,131,151,0.22)]",
    height: "h-[190px]",
    lift: "translate-y-4",
    icon: <Medal size={28} fill="#C9D0DA" className="text-[#8B95A6]" />,
  },
  3: {
    color: "text-[#B86A26]",
    glow: "shadow-[0_14px_30px_rgba(184,106,38,0.22)]",
    height: "h-[165px]",
    lift: "translate-y-8",
    icon: <Medal size={28} fill="#D18A44" className="text-[#B86A26]" />,
  },
} as const;

const styles = {
  wrap: "relative mx-auto mb-12 grid min-h-[330px] w-full max-w-[850px] grid-cols-3 items-end gap-5 pt-14",
  spot: "leaderboard-pop relative flex flex-col items-center text-center transition-transform hover:-translate-y-2",
  avatar: "absolute -top-10 z-20 rounded-full ring-4 ring-white",
  icon: "absolute -top-[78px] z-30",
  cloudBox: "relative flex w-full flex-col items-center justify-end rounded-[32px] bg-white/50 px-3 pb-5",
  cloud: "absolute inset-x-0 bottom-7 mx-auto w-[92%] object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.12)]",
  rank: "relative z-10 text-[42px] font-black leading-none tracking-tight",
  name: "relative z-10 mt-3 max-w-full truncate text-sm font-semibold text-text-main",
  rep: "relative z-10 text-xs text-text-muted",
  shimmer: "leaderboard-shimmer bg-[linear-gradient(110deg,#1d2433_0%,#FF9E00_42%,#1d2433_70%)] bg-[length:220%_100%] bg-clip-text text-transparent",
};

export default function LeaderboardPodium({ users }: Props) {
  const ordered = [users[1], users[0], users[2]].filter(Boolean);

  return (
    <div className={styles.wrap}>
      <style>{`
        @keyframes leaderboard-pop { from { opacity: 0; transform: translateY(28px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes leaderboard-shimmer { to { background-position: -220% 0; } }
        .leaderboard-pop { animation: leaderboard-pop .58s cubic-bezier(.2,.9,.2,1) both; }
        .leaderboard-pop:nth-child(2) { animation-delay: .08s; }
        .leaderboard-pop:nth-child(3) { animation-delay: .16s; }
        .leaderboard-shimmer { animation: leaderboard-shimmer 3.4s linear infinite; }
      `}</style>
      {ordered.map((user) => {
        const rank = (users.findIndex((item) => item.userId === user.userId) + 1) as 1 | 2 | 3;
        const theme = rankStyles[rank];
        return (
          <Link key={user.userId} to={`/profile/${user.username}`} className={`${styles.spot} ${theme.lift}`}>
            <div className={styles.icon}>{theme.icon}</div>
            <Avatar username={user.username} src={user.profileImage ?? undefined} size="md" className={styles.avatar} />
            <div className={`${styles.cloudBox} ${theme.height} ${theme.glow}`}>
              <img src="/OrangeCloud.png" alt="" className={styles.cloud} />
              <span className={`${styles.rank} ${theme.color}`}>#{rank}</span>
              <span className={`${styles.name} ${rank === 1 ? styles.shimmer : ""}`}>{user.username}</span>
              <span className={styles.rep}>{user.reputation} reputation</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
