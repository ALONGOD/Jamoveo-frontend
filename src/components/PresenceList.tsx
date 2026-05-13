'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { ConnectedUser, INSTRUMENT_LABELS } from '@/types';

interface Props {
  /** "card"  = full card with title + grid (PlayerWaiting, AdminSearch). */
  /** "badge" = tiny floating count chip; tap to open a modal with the full list (Live). */
  variant?: 'card' | 'badge';
  className?: string;
}

// Sort: admin first, then yourself, then alphabetical — feels natural in the room.
const usePresence = () => {
  const { user } = useAuth();
  const { connectedUsers } = useSocket();
  const sorted = [...connectedUsers].sort((a, b) => {
    if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
    if (user) {
      if (a.userId === user.id) return -1;
      if (b.userId === user.id) return 1;
    }
    return a.username.localeCompare(b.username);
  });
  return { users: sorted, currentUserId: user?.id };
};

export const PresenceList = ({ variant = 'card', className }: Props) => {
  const { users, currentUserId } = usePresence();
  // Modal open state (only used by the badge variant). Hooks can't be conditional,
  // so we always declare it — costs nothing for the card variant.
  const [isOpen, setIsOpen] = useState(false);

  if (users.length === 0) return null;

  if (variant === 'badge') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`${users.length} musicians in the room — tap to see who`}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/80 px-2.5 py-1 text-xs font-semibold text-neutral-200 shadow-md backdrop-blur transition hover:border-brand hover:text-white',
            className
          )}
        >
          <span aria-hidden>👥</span>
          <span>{users.length}</span>
        </button>

        {isOpen && (
          // Click anywhere on the backdrop closes; the inner box stops propagation
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-100">
                  In the room ({users.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                  className="rounded-md px-2 py-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
                >
                  ✕
                </button>
              </div>
              <UserList users={users} currentUserId={currentUserId} />
            </div>
          </div>
        )}
      </>
    );
  }
  
  return (
    <div
      className={clsx(
        'rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-left backdrop-blur',
        className
      )}
    >
      <p className="mb-3 text-center text-sm font-semibold text-neutral-300">
        {users.length} {users.length === 1 ? 'musician' : 'musicians'} in the room
      </p>
      <UserList users={users} currentUserId={currentUserId} />
    </div>
  );
};

const UserList = ({
  users,
  currentUserId,
}: {
  users: ConnectedUser[];
  currentUserId?: string;
}) => (
  <ul className="grid grid-cols-1 gap-2">
    {users.map((u) => (
      <li
        key={u.userId}
        className="flex items-center gap-3 rounded-lg bg-neutral-800/60 px-3 py-2"
      >
        <Avatar name={u.username} role={u.role} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-100">
            {u.username}
            {u.userId === currentUserId && (
              <span className="ml-1.5 text-xs font-normal text-neutral-500">(you)</span>
            )}
          </p>
          <p className="truncate text-xs text-neutral-400">{INSTRUMENT_LABELS[u.instrument]}</p>
        </div>
        {u.role === 'admin' && (
          <span className="shrink-0 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-300">
            admin
          </span>
        )}
      </li>
    ))}
  </ul>
);

const Avatar = ({ name, role }: { name: string; role: ConnectedUser['role'] }) => (
  <span
    className={clsx(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white',
      role === 'admin' ? 'bg-amber-600/80' : 'bg-brand/80'
    )}
  >
    {name.charAt(0)}
  </span>
);
