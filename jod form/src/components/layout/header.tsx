'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, FileText, User, MapPin, Bell, Check, Info, FileSignature } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockJobs, mockClients } from '@/lib/mock-data';

interface SearchResult {
  id: string;
  type: 'job' | 'client' | 'address';
  title: string;
  subtitle: string;
  href: string;
}

const RECENT_SEARCHES_KEY = 'visionsolar_recent_searches';
const MAX_RECENT = 5;

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Load recent searches and notifications
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
    
    async function fetchNotifs() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) setNotifications(await res.json());
      } catch (e) { console.error(e); }
    }
    fetchNotifs();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const jobResults: SearchResult[] = mockJobs
        .filter(j =>
          j.job_number.toLowerCase().includes(q) ||
          j.client?.first_name.toLowerCase().includes(q) ||
          j.client?.last_name.toLowerCase().includes(q) ||
          j.address.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .map(j => ({
          id: j.id,
          type: 'job',
          title: `${j.job_number} — ${j.client?.first_name} ${j.client?.last_name}`,
          subtitle: j.address,
          href: `/dashboard?job=${j.id}`,
        }));

      const clientResults: SearchResult[] = mockClients
        .filter(c =>
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        )
        .slice(0, 3)
        .map(c => ({
          id: c.id,
          type: 'client',
          title: `${c.first_name} ${c.last_name}`,
          subtitle: c.email,
          href: `/dashboard?client=${c.id}`,
        }));

      setResults([...jobResults, ...clientResults]);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSelect = (result: SearchResult) => {
    saveSearch(result.title);
    setQuery('');
    setShowDropdown(false);
    router.push(result.href);
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) { console.error(e); }
  };

  const iconForType = (type: string) => {
    switch (type) {
      case 'job': return <FileText className="w-4 h-4 text-vision-green" />;
      case 'client': return <User className="w-4 h-4 text-solar-orange" />;
      case 'address': return <MapPin className="w-4 h-4 text-mid-gray" />;
      case 'esign': return <FileSignature className="w-4 h-4 text-purple-500" />;
      case 'system': return <Info className="w-4 h-4 text-blue-500" />;
      case 'form': return <FileText className="w-4 h-4 text-vision-green" />;
      default: return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-light-gray flex items-center justify-between px-6 shrink-0 z-40 relative">
      
      {/* Left Area: Placeholder to keep center centered */}
      <div className="hidden md:block min-w-[200px]"></div>

      {/* Center Area: Prominent Wide Search */}
      <div className="relative flex-1 max-w-2xl mx-8">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-mid-gray group-focus-within:text-vision-green transition-colors" />
          </div>
          <Input
            ref={inputRef}
            id="global-search"
            type="text"
            placeholder="Search forms, clients, templates..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="block w-full pl-10 pr-10 h-10 bg-off-white border border-light-gray/80 rounded-lg text-sm transition-all focus:bg-white focus:border-vision-green/50 focus:ring-4 focus:ring-vision-green/10 focus:shadow-sm hover:border-gray-300"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mid-gray hover:text-charcoal transition-colors bg-light-gray/20 hover:bg-light-gray/50 rounded-md p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (query || recentSearches.length > 0) && (
          <div
            ref={dropdownRef}
            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-light-gray rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in"
          >
            {/* Results */}
            {results.length > 0 && (
              <div className="py-2">
                <div className="px-4 pb-1 pt-1 border-b border-light-gray/50 mb-1">
                  <p className="text-[10px] font-bold text-mid-gray tracking-widest uppercase">Matching Results</p>
                </div>
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-off-white transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded border border-light-gray/50 bg-white flex items-center justify-center shrink-0">
                      {iconForType(r.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{r.title}</p>
                      <p className="text-xs text-mid-gray truncate leading-tight">{r.subtitle}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-mid-gray font-medium bg-off-white px-2 py-0.5 rounded border border-light-gray/50">
                      {r.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {query && results.length === 0 && (
              <div className="py-8 text-center">
                <Search className="w-6 h-6 text-light-gray mx-auto mb-2" />
                <p className="text-sm text-dark-gray font-medium">No results found</p>
              </div>
            )}

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 pb-1 pt-1 border-b border-light-gray/50 mb-1">
                  <p className="text-[10px] font-bold text-mid-gray tracking-widest uppercase">Recent Searches</p>
                </div>
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuery(s); setShowDropdown(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-off-white transition-colors text-left group"
                  >
                    <Clock className="w-3.5 h-3.5 text-mid-gray/50 group-hover:text-vision-green transition-colors" />
                    <span className="text-sm text-dark-gray font-medium group-hover:text-charcoal transition-colors">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Status & Tools */}
      <div className="flex items-center gap-4 min-w-[200px] justify-end">
        
        {/* Date Display */}
        <div className="flex flex-col items-end mr-2">
          <p className="text-[10px] font-bold text-mid-gray tracking-widest uppercase">
            {new Date().toLocaleDateString('en-AU', { weekday: 'long' })}
          </p>
          <p className="text-sm font-semibold text-charcoal">
            {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="w-px h-8 bg-light-gray/70"></div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            suppressHydrationWarning
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-all group border ${
              showNotifications ? 'bg-accent text-vision-green border-vision-green/20' : 'text-mid-gray hover:bg-off-white hover:text-charcoal border-transparent hover:border-light-gray/50'
            }`}
          >
            <Bell className={`w-5 h-5 ${showNotifications ? '' : 'group-hover:animate-wiggle'}`} />
            {notifications.some(n => n.unread) && (
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-solar-orange rounded-full border border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white border border-light-gray rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-light-gray flex items-center justify-between bg-off-white/50">
                <h3 className="text-sm font-bold text-charcoal">Notifications</h3>
                <span className="text-[10px] bg-vision-green/10 text-vision-green px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {notifications.filter(n => n.unread).length} New
                </span>
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-light-gray mx-auto mb-2 opacity-20" />
                    <p className="text-xs text-mid-gray font-medium">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`px-4 py-3 border-b border-light-gray/40 hover:bg-off-white transition-colors cursor-pointer group relative ${n.unread ? 'bg-vision-green/[0.02]' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-light-gray/60 ${n.unread ? 'bg-white shadow-sm' : 'bg-off-white opacity-60'}`}>
                          {iconForType(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-xs font-bold truncate ${n.unread ? 'text-charcoal' : 'text-mid-gray'}`}>{n.title}</p>
                            <span className="text-[10px] text-mid-gray whitespace-nowrap ml-2">{n.time}</span>
                          </div>
                          <p className={`text-[11px] leading-relaxed line-clamp-2 ${n.unread ? 'text-dark-gray' : 'text-mid-gray/80'}`}>
                            {n.description}
                          </p>
                        </div>
                      </div>
                      {n.unread && (
                        <div className="absolute right-4 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-vision-green/10 text-vision-green p-1 rounded-md">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-light-gray bg-off-white/30 text-center">
                <button className="text-[11px] font-bold text-vision-green hover:text-green-dark transition-colors py-1 w-full rounded-md hover:bg-vision-green/5">
                  View All Activity
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
