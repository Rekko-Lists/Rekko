import { Link } from "react-router-dom";
import Avatar from "@/components/ui/common/Avatar";
import type { ReputationUser } from "@/lib/userService";

interface Props {
  users: ReputationUser[];
  startRank?: number;
}

const styles = {
  list: "mx-auto flex w-full max-w-[780px] flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-white/60",
  row: "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-primary/5",
  rank: "w-10 text-sm font-bold text-primary",
  user: "min-w-0 flex-1 text-sm font-medium text-text-main hover:text-primary",
  rep: "text-xs text-text-muted",
};

export default function LeaderboardList({ users, startRank = 4 }: Props) {
  return (
    <div className={styles.list}>
      {users.map((user, index) => (
        <div key={user.userId} className={styles.row}>
          <span className={styles.rank}>#{index + startRank}</span>
          <Avatar username={user.username} src={user.profileImage ?? undefined} size="sm" />
          <Link to={`/profile/${user.username}`} className={styles.user}>{user.username}</Link>
          <span className={styles.rep}>{user.reputation}</span>
        </div>
      ))}
    </div>
  );
}
