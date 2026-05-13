'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { createSocket } from '@/lib/socket';
import { ConnectedUser, Song } from '@/types';

interface SocketContextValue {
  isConnected: boolean;
  currentSong: Song | null;
  connectedUsers: ConnectedUser[];
  selectSong: (song: Song) => void;
  quitSession: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  isConnected: false,
  currentSong: null,
  connectedUsers: [],
  selectSong: () => {},
  quitSession: () => {},
});

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setCurrentSong(null);
      setConnectedUsers([]);
      return;
    }

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // On connect, server pushes current song (or null) so late joiners sync to /live immediately
    socket.on('session:state', ({ currentSong: song }: { currentSong: Song | null }) => {
      setCurrentSong(song);
      if (song) router.push('/live');
    });

    socket.on('song:current', ({ song }: { song: Song }) => {
      setCurrentSong(song);
      router.push('/live');
    });

    socket.on('session:cleared', () => {
      setCurrentSong(null);
      router.push('/');
    });

    // Server pushes a fresh deduped list whenever someone joins/leaves
    socket.on('presence:list', ({ users }: { users: ConnectedUser[] }) => {
      setConnectedUsers(users);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, token, router]);

  const selectSong = useCallback((song: Song) => {
    socketRef.current?.emit('song:select', song);
  }, []);

  const quitSession = useCallback(() => {
    socketRef.current?.emit('session:quit');
  }, []);

  const value = useMemo(
    () => ({ isConnected, currentSong, connectedUsers, selectSong, quitSession }),
    [isConnected, currentSong, connectedUsers, selectSong, quitSession]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
