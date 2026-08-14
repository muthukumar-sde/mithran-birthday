'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw,
  Search,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Clock,
  MapPin,
  Laptop,
  Compass,
} from 'lucide-react';
import styles from './Track.module.scss';

export interface VisitLog {
  id: string;
  timestamp: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  org: string;
  userAgent: string;
  device: string;
  browser: string;
  osName: string;
  screen: string;
  language: string;
  referrer: string;
  path: string;
}

function getCountryFlag(code: string) {
  if (!code || code === 'XX' || code === 'DEV') return '🌐';
  try {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

function formatDate(isoStr: string) {
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return isoStr;
  }
}

function timeAgo(isoStr: string) {
  try {
    const now = new Date().getTime();
    const past = new Date(isoStr).getTime();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  } catch {
    return '';
  }
}

export default function TrackClient() {
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/track');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.visits || []);
      }
    } catch (err) {
      console.error('Failed to fetch visit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/track', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setIsClearing(false);
      setShowConfirmModal(false);
    }
  };

  // Filter logs by search term
  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (log) =>
        log.ip.toLowerCase().includes(q) ||
        log.city.toLowerCase().includes(q) ||
        log.country.toLowerCase().includes(q) ||
        log.osName.toLowerCase().includes(q) ||
        log.browser.toLowerCase().includes(q) ||
        log.userAgent.toLowerCase().includes(q) ||
        log.device.toLowerCase().includes(q) ||
        log.path.toLowerCase().includes(q)
    );
  }, [logs, search]);

  // Compute analytics stats
  const stats = useMemo(() => {
    const totalVisits = logs.length;
    const uniqueIps = new Set(logs.map((l) => l.ip)).size;
    const mobileCount = logs.filter((l) => l.device === 'Mobile' || l.device === 'Tablet').length;
    const mobilePercent = totalVisits > 0 ? Math.round((mobileCount / totalVisits) * 100) : 0;

    // Top country
    const countryCounts: Record<string, number> = {};
    logs.forEach((l) => {
      if (l.country && l.country !== 'Unknown Country') {
        countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
      }
    });

    let topCountry = 'None';
    let maxCount = 0;
    Object.entries(countryCounts).forEach(([country, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCountry = country;
      }
    });

    return { totalVisits, uniqueIps, mobilePercent, topCountry };
  }, [logs]);

  return (
    <main className={styles.trackContainer}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>
              Visitor Analytics <span className={styles.liveBadge}><ShieldCheck size={14} /> Live Logs</span>
            </h1>
            <p className={styles.subtitle}>
              Real-time user agent, geolocation, and access log tracker for mithran-birthday.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button onClick={fetchLogs} className={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setShowConfirmModal(true)} className={styles.clearBtn} disabled={logs.length === 0}>
            <Trash2 size={16} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Users size={22} className={styles.statIconGold} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Page Views</span>
            <span className={styles.statValue}>{stats.totalVisits}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Globe size={22} className={styles.statIconBlue} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Unique Visitor IPs</span>
            <span className={styles.statValue}>{stats.uniqueIps}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Compass size={22} className={styles.statIconPink} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Top Location</span>
            <span className={styles.statValueText}>{stats.topCountry}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <Smartphone size={22} className={styles.statIconGreen} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Mobile Traffic</span>
            <span className={styles.statValue}>{stats.mobilePercent}%</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by IP, City, Country, OS, Browser, or User Agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch('')} className={styles.clearSearchBtn}>
              ✕
            </button>
          )}
        </div>
        <div className={styles.resultCount}>
          Showing <span>{filteredLogs.length}</span> of {logs.length} entries
        </div>
      </div>

      {/* Responsive Table / Card View */}
      {loading && logs.length === 0 ? (
        <div className={styles.loadingState}>
          <RefreshCw size={32} className={styles.spinning} />
          <p>Loading visitor logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyIcon} />
          <h3>No Visit Logs Found</h3>
          <p>{search ? 'No entries match your search filter.' : 'Visit logs will appear here when visitors view the website.'}</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          {/* Desktop Table View */}
          <table className={styles.desktopTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Location</th>
                <th>Device & OS</th>
                <th>Browser</th>
                <th>IP Address</th>
                <th>Screen</th>
                <th>Path & Referrer</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const flag = getCountryFlag(log.countryCode);
                const isMobile = log.device === 'Mobile' || log.device === 'Tablet';

                return (
                  <tr key={log.id}>
                    <td className={styles.indexCol}>{filteredLogs.length - index}</td>
                    <td className={styles.timeCol}>
                      <div className={styles.timeWrap}>
                        <Clock size={13} />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                      <span className={styles.timeAgoBadge}>{timeAgo(log.timestamp)}</span>
                    </td>
                    <td className={styles.locCol}>
                      <div className={styles.locWrap}>
                        <span className={styles.flagEmoji}>{flag}</span>
                        <div>
                          <div className={styles.cityText}>
                            {log.city !== 'Unknown City' ? log.city : ''}{' '}
                            {log.country !== 'Unknown Country' ? log.country : 'Unknown Location'}
                          </div>
                          {log.org && log.org !== 'Unknown ISP' && <span className={styles.orgText}>{log.org}</span>}
                        </div>
                      </div>
                    </td>
                    <td className={styles.deviceCol}>
                      <span className={`${styles.deviceBadge} ${isMobile ? styles.badgeMobile : styles.badgeDesktop}`}>
                        {isMobile ? <Smartphone size={13} /> : <Monitor size={13} />}
                        {log.device} • {log.osName}
                      </span>
                    </td>
                    <td className={styles.browserCol}>
                      <span className={styles.browserTag}>{log.browser}</span>
                    </td>
                    <td className={styles.ipCol}>
                      <code className={styles.ipCode}>{log.ip}</code>
                    </td>
                    <td className={styles.screenCol}>{log.screen}</td>
                    <td className={styles.pathCol}>
                      <span className={styles.pathTag}>{log.path}</span>
                      <span className={styles.referrerTag}>{log.referrer}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Card List View */}
          <div className={styles.mobileCardList}>
            {filteredLogs.map((log, index) => {
              const flag = getCountryFlag(log.countryCode);
              const isMobile = log.device === 'Mobile' || log.device === 'Tablet';

              return (
                <div key={log.id} className={styles.logCard}>
                  <div className={styles.logCardHeader}>
                    <div className={styles.logCardNum}>#{filteredLogs.length - index}</div>
                    <div className={styles.logCardTime}>
                      <Clock size={13} />
                      <span>{timeAgo(log.timestamp)}</span>
                    </div>
                  </div>

                  <div className={styles.logCardRow}>
                    <MapPin size={16} className={styles.cardIconGold} />
                    <div className={styles.logCardLoc}>
                      <span className={styles.flagEmoji}>{flag}</span>
                      <strong>
                        {log.city !== 'Unknown City' ? `${log.city}, ` : ''}
                        {log.country}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.logCardMetaGrid}>
                    <div className={styles.logCardMetaItem}>
                      <span className={styles.metaLabel}>Device / OS:</span>
                      <span className={`${styles.deviceBadge} ${isMobile ? styles.badgeMobile : styles.badgeDesktop}`}>
                        {isMobile ? <Smartphone size={12} /> : <Laptop size={12} />}
                        {log.device} • {log.osName}
                      </span>
                    </div>

                    <div className={styles.logCardMetaItem}>
                      <span className={styles.metaLabel}>Browser:</span>
                      <span className={styles.browserTag}>{log.browser}</span>
                    </div>

                    <div className={styles.logCardMetaItem}>
                      <span className={styles.metaLabel}>IP Address:</span>
                      <code className={styles.ipCode}>{log.ip}</code>
                    </div>

                    <div className={styles.logCardMetaItem}>
                      <span className={styles.metaLabel}>Screen:</span>
                      <span>{log.screen}</span>
                    </div>
                  </div>

                  <div className={styles.logCardFooter}>
                    <span>Exact Time: {formatDate(log.timestamp)}</span>
                    <div className={styles.uaAccordion}>UA: {log.userAgent}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Clearing Logs */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIconWrap}>
                <Trash2 size={28} />
              </div>
              <h3>Clear All Visit Logs?</h3>
              <p>Are you sure you want to permanently clear all tracked user logs? This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button onClick={() => setShowConfirmModal(false)} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleClearLogs} className={styles.confirmDeleteBtn} disabled={isClearing}>
                  {isClearing ? 'Clearing...' : 'Yes, Clear All'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
