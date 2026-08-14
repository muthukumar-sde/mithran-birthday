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
  Download,
  ExternalLink,
  Copy,
  Check,
  X,
  Cpu,
  Info,
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
  latitude?: number | null;
  longitude?: number | null;
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
    const diffSec = Math.max(0, Math.floor((now - past) / 1000));
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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedLog, setSelectedLog] = useState<VisitLog | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Live Auto-Refresh (Poll every 10 seconds if enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/track', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        setSelectedLog(null);
      }
    } catch (err) {
      console.error('Failed to clear logs:', err);
    } finally {
      setIsClearing(false);
      setShowConfirmModal(false);
    }
  };

  const exportLogsJSON = () => {
    if (logs.length === 0) return;
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mithran_visitor_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLogDetails = (log: VisitLog) => {
    const formatted = `=== VISITOR LOG DETAILS ===
IP Address: ${log.ip}
Timestamp: ${log.timestamp} (${formatDate(log.timestamp)})
Location: ${log.city}, ${log.region}, ${log.country} (${log.countryCode})
ISP / Org: ${log.org}
Coordinates: ${log.latitude && log.longitude ? `${log.latitude}, ${log.longitude}` : 'N/A'}
Device: ${log.device}
OS: ${log.osName}
Browser: ${log.browser}
Screen: ${log.screen}
Language: ${log.language}
Path Visited: ${log.path}
Referrer: ${log.referrer}
User Agent: ${log.userAgent}`;

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        log.region.toLowerCase().includes(q) ||
        log.osName.toLowerCase().includes(q) ||
        log.browser.toLowerCase().includes(q) ||
        log.userAgent.toLowerCase().includes(q) ||
        log.device.toLowerCase().includes(q) ||
        log.path.toLowerCase().includes(q) ||
        log.org.toLowerCase().includes(q)
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
              Visitor Analytics <span className={styles.liveBadge}><ShieldCheck size={14} /> Live Visitor Log</span>
            </h1>
            <p className={styles.subtitle}>
              Real-time user agent, geolocation, IP, and visitor details stored in visitor log file.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`${styles.autoRefreshToggle} ${autoRefresh ? styles.autoRefreshActive : ''}`}
            title="Toggle Live Auto Refresh every 10s"
          >
            <RefreshCw size={14} className={autoRefresh ? styles.spinning : ''} />
            <span>{autoRefresh ? 'Live Auto: ON' : 'Live Auto: OFF'}</span>
          </button>
          <button onClick={fetchLogs} className={styles.refreshBtn} disabled={loading}>
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={exportLogsJSON} className={styles.exportBtn} disabled={logs.length === 0}>
            <Download size={16} />
            <span>Export JSON</span>
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
            <span className={styles.statLabel}>Total Page Visits</span>
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
            placeholder="Search by IP, City, Country, OS, Browser, ISP, or Path..."
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
          Showing <span>{filteredLogs.length}</span> of {logs.length} entries • <em>Click any entry to view full detail</em>
        </div>
      </div>

      {/* Responsive Table / Card View */}
      {loading && logs.length === 0 ? (
        <div className={styles.loadingState}>
          <RefreshCw size={32} className={styles.spinning} />
          <p>Loading visitor logs from log file...</p>
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
                <th>Path</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => {
                const flag = getCountryFlag(log.countryCode);
                const isMobile = log.device === 'Mobile' || log.device === 'Tablet';

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={styles.clickableRow}
                    title="Click to view complete visitor details"
                  >
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
                            {log.city !== 'Unknown City' ? (
                              <>
                                <strong>{log.city}</strong>
                                {log.region && log.region !== 'Unknown Region' ? `, ${log.region}` : ''}
                              </>
                            ) : (
                              'Unknown City'
                            )}{' '}
                            <span className={styles.countrySub}>
                              {log.country !== 'Unknown Country' ? `(${log.country})` : ''}
                            </span>
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
                    </td>
                    <td className={styles.actionCol}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className={styles.viewDetailBtn}
                      >
                        <Info size={14} />
                        <span>Details</span>
                      </button>
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
                <div
                  key={log.id}
                  className={styles.logCard}
                  onClick={() => setSelectedLog(log)}
                >
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
                        {log.city !== 'Unknown City' ? log.city : ''}
                        {log.region && log.region !== 'Unknown Region' ? `, ${log.region}` : ''}
                        {log.country !== 'Unknown Country' ? ` (${log.country})` : ''}
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
                    <button className={styles.cardDetailLink}>
                      <Info size={12} /> View Full Detail
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISITOR DETAIL INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className={styles.detailModalCard}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={styles.detailHeader}>
                <div className={styles.detailTitleWrap}>
                  <span className={styles.detailFlagEmoji}>{getCountryFlag(selectedLog.countryCode)}</span>
                  <div>
                    <h2 className={styles.detailTitle}>
                      {selectedLog.city !== 'Unknown City' ? selectedLog.city : 'Visitor Details'}
                      {selectedLog.region && selectedLog.region !== 'Unknown Region' ? `, ${selectedLog.region}` : ''}
                    </h2>
                    <p className={styles.detailSub}>
                      {selectedLog.country} ({selectedLog.countryCode}) • IP: <code>{selectedLog.ip}</code>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className={styles.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              {/* Detail Toolbar Actions */}
              <div className={styles.detailToolbar}>
                <button onClick={() => copyLogDetails(selectedLog)} className={styles.detailActionBtn}>
                  {copied ? <Check size={14} className={styles.greenIcon} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Details'}</span>
                </button>

                {selectedLog.latitude && selectedLog.longitude ? (
                  <a
                    href={`https://www.google.com/maps?q=${selectedLog.latitude},${selectedLog.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapLinkBtn}
                  >
                    <MapPin size={14} />
                    <span>View Map Location</span>
                    <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>

              {/* Grid Sections */}
              <div className={styles.detailGrid}>
                {/* 1. Location & Network */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionHeading}>
                    <Globe size={16} /> Location & Network
                  </h4>
                  <div className={styles.fieldList}>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>IP Address</span>
                      <code className={styles.fieldValueCode}>{selectedLog.ip}</code>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>City / Region</span>
                      <span className={styles.fieldValue}>
                        {selectedLog.city}, {selectedLog.region}
                      </span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Country</span>
                      <span className={styles.fieldValue}>
                        {selectedLog.country} ({selectedLog.countryCode})
                      </span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>ISP / Provider</span>
                      <span className={styles.fieldValue}>{selectedLog.org || 'Unknown'}</span>
                    </div>
                    {selectedLog.latitude && selectedLog.longitude ? (
                      <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Geo Coordinates</span>
                        <span className={styles.fieldValue}>
                          {selectedLog.latitude}, {selectedLog.longitude}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 2. Device & System */}
                <div className={styles.detailSection}>
                  <h4 className={styles.sectionHeading}>
                    <Cpu size={16} /> Device & Environment
                  </h4>
                  <div className={styles.fieldList}>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Device Type</span>
                      <span className={styles.fieldValue}>{selectedLog.device}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Operating System</span>
                      <span className={styles.fieldValue}>{selectedLog.osName}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Browser</span>
                      <span className={styles.fieldValue}>{selectedLog.browser}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Screen Resolution</span>
                      <span className={styles.fieldValue}>{selectedLog.screen}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Language</span>
                      <span className={styles.fieldValue}>{selectedLog.language}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Session & Page Access */}
                <div className={styles.detailSectionFull}>
                  <h4 className={styles.sectionHeading}>
                    <Clock size={16} /> Access & Session Info
                  </h4>
                  <div className={styles.fieldList}>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Date & Time</span>
                      <span className={styles.fieldValue}>
                        {formatDate(selectedLog.timestamp)} ({timeAgo(selectedLog.timestamp)})
                      </span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Visited Path</span>
                      <span className={styles.fieldValueHighlight}>{selectedLog.path}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>Referrer</span>
                      <span className={styles.fieldValue}>{selectedLog.referrer}</span>
                    </div>
                    <div className={styles.fieldRowStacked}>
                      <span className={styles.fieldLabel}>User-Agent String</span>
                      <div className={styles.uaBox}>{selectedLog.userAgent}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <p>Are you sure you want to permanently clear all tracked user logs from the log file? This action cannot be undone.</p>
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
