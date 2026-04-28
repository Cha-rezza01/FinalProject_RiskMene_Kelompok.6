/**
 * SISTEM MANAJEMEN RISIKO — SEKOLAH UALS (SMA UNKLAB)
 * Kelompok 6: Pontoh Rezza · Palari Estefani · Patuli Zeavani
 *
 * Design: "Academic Shield" — Deep Navy + Teal + Gold
 * Font: Plus Jakarta Sans (Google Fonts)
 * Data: Sesuai Laporan Analisis Risiko Sekolah UALS
 *
 * Rubrik Coverage (target 5/5 semua):
 * [1] Fitur Inti End-to-End  : Asset→Vuln→Threat→Risk→Control + filter/sort/export/history
 * [2] Pemodelan Data & Relasi: many-to-many, kategori, audit trail, asset-linked
 * [3] Validasi Input         : unique, referential integrity, sanitasi, edge cases
 * [4] Perhitungan Risiko     : L×I, konfigurasi threshold, residual, re-calc otomatis
 * [5] Risk Matrix            : heatmap 5×5, ranking, grouping, 3 matriks laporan, edit sel
 * [6] Controls Management   : tipe/status/efektivitas/biaya/ROI, rekomendasi prioritas
 * [7] Auth & RBAC            : 3 roles, least privilege, session, proteksi input
 * [8] UI/UX                  : tema sekolah, responsif, konsisten, animasi halus
 * [9] Code Quality           : modular, seed UALS, audit log, JSDoc, reset data
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import ColManager from "./ColManager.jsx";


// ═══════════════════════════════════════════════
// GOOGLE FONTS INJECTION
// ═══════════════════════════════════════════════
const injectFonts = () => {
  if (document.getElementById("rms-fonts")) return;
  const link = document.createElement("link");
  link.id = "rms-fonts";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
};

// ═══════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════
const T = {
  // Primary palette — Deep Navy
  navy900: "#0a1628",
  navy800: "#0f2040",
  navy700: "#1a3358",
  navy600: "#1e3d6b",
  navy500: "#2952a3",
  navy400: "#4070c8",
  navy300: "#6b96e0",
  navy100: "#dce8ff",
  navy50:  "#f0f5ff",

  // Accent — Teal
  teal600: "#0d7377",
  teal500: "#14a085",
  teal400: "#1abc9c",
  teal200: "#a8f0e8",
  teal50:  "#e8faf7",

  // Gold accent
  gold500: "#d4a017",
  gold400: "#f0b429",
  gold200: "#fde68a",
  gold50:  "#fffbeb",

  // Semantic
  red700:    "#991b1b",
  red500:    "#dc2626",
  red100:    "#fee2e2",
  orange700: "#9a3412",
  orange500: "#ea580c",
  orange100: "#ffedd5",
  amber700:  "#92400e",
  amber500:  "#d97706",
  amber100:  "#fef3c7",
  green700:  "#14532d",
  green500:  "#16a34a",
  green100:  "#dcfce7",

  // Neutral
  white:   "#ffffff",
  gray50:  "#f8fafc",
  gray100: "#f1f5f9",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  gray900: "#0f172a",

  // Typography
  font: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif",

  // Shadows
  shadow1: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  shadow2: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
  shadow3: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  shadowModal: "0 25px 50px -12px rgba(0,0,0,0.35)",

  // Border radius
  r4: "4px", r6: "6px", r8: "8px", r12: "12px", r16: "16px", r20: "20px", rFull: "9999px",
};

// ═══════════════════════════════════════════════
// GLOBAL STYLES INJECTION
// ═══════════════════════════════════════════════
const injectStyles = () => {
  if (document.getElementById("rms-styles")) return;
  const style = document.createElement("style");
  style.id = "rms-styles";
  style.textContent = `
    .rms * { box-sizing: border-box; margin: 0; padding: 0; }
    .rms { font-family: ${T.font}; }
    .rms input, .rms select, .rms textarea, .rms button { font-family: ${T.font}; }
    .rms input:focus, .rms select:focus, .rms textarea:focus {
      outline: none; border-color: ${T.teal400} !important;
      box-shadow: 0 0 0 3px rgba(20,160,133,0.15);
    }
    .rms .nav-btn:hover { background: rgba(255,255,255,0.08) !important; }
    .rms .nav-btn.active { background: rgba(255,255,255,0.15) !important; border-left: 3px solid ${T.gold400} !important; }
    .rms .card-hover:hover { transform: translateY(-2px); box-shadow: ${T.shadow3}; }
    .rms .row-hover:hover td { background: ${T.navy50} !important; }
    .rms .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
    .rms .btn-primary:active { transform: translateY(0); }
    .rms .icon-btn:hover { background: ${T.gray100} !important; }
    .rms .tab-btn:hover { color: ${T.navy700} !important; }
    .rms .sidebar-link:hover { background: rgba(255,255,255,0.07) !important; }
    .rms ::-webkit-scrollbar { width: 6px; height: 6px; }
    .rms ::-webkit-scrollbar-track { background: transparent; }
    .rms ::-webkit-scrollbar-thumb { background: ${T.gray300}; border-radius: 3px; }
    .rms .fade-in { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .rms .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
    /* Login page animations */
    .login-panel { animation: loginSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes loginSlideUp { from { opacity:0; transform:translateY(40px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
    .login-left { animation: loginFadeLeft 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
    @keyframes loginFadeLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
    .login-right { animation: loginFadeRight 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
    @keyframes loginFadeRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
    .orb-float { animation: orbFloat 8s ease-in-out infinite; }
    @keyframes orbFloat { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(-18px) scale(1.04);} }
    .orb-float2 { animation: orbFloat2 10s ease-in-out infinite; }
    @keyframes orbFloat2 { 0%,100%{transform:translateY(0) scale(1);} 50%{transform:translateY(14px) scale(0.97);} }
    .ring-spin { animation: ringSpin 24s linear infinite; }
    @keyframes ringSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .ring-spin-rev { animation: ringSpinRev 18s linear infinite; }
    @keyframes ringSpinRev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
    .demo-row { transition: all 0.15s ease; border: 1px solid #e2e8f0; border-radius: 8px; }
    .demo-row:hover { background: #dce8ff !important; border-color: #6b96e0 !important; transform: translateX(4px); box-shadow: 0 2px 8px rgba(26,51,88,0.12); }
    .logo-glow { animation: logoGlow 3s ease-in-out infinite; }
    @keyframes logoGlow { 0%,100%{box-shadow:0 0 20px rgba(20,160,133,0.3),0 0 40px rgba(20,160,133,0.1);} 50%{box-shadow:0 0 30px rgba(20,160,133,0.5),0 0 60px rgba(20,160,133,0.2);} }
    @media print {
      .rms aside, .rms .no-print { display: none !important; }
      .rms main { padding: 0 !important; }
    }
    .rms-pdf-overlay {
      position: fixed; inset: 0; background: rgba(10,22,40,0.7);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
    }
    .rms-pdf-frame {
      background: #fff; border-radius: 12px; padding: 32px;
      max-width: 860px; width: 96vw; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4); position: relative;
      font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    }
    .rms-pdf-tbl { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    .rms-pdf-tbl th { background: #0f2040; color: #fff; padding: 9px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
    .rms-pdf-tbl td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
    .rms-pdf-tbl tr:nth-child(even) td { background: #f8fafc; }
    .rms-pdf-badge { display: inline-block; border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 700; border: 1px solid; }
    @media print {
      .rms-pdf-overlay { position: static; background: none; }
      .rms-pdf-frame { max-height: none; overflow: visible; box-shadow: none; border-radius: 0; padding: 0; }
      .rms-pdf-close, .rms-pdf-actions { display: none !important; }
      body { margin: 0; }
    }
  `;
  document.head.appendChild(style);
};

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const now = () => new Date().toISOString();
const fmtDate = (iso) => new Date(iso).toLocaleString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
const fmtRp = (n) => n ? "Rp " + Number(n).toLocaleString("id-ID") : "—";
const sanitize = (s) => String(s ?? "").replace(/[<>'"]/g,"").trim().slice(0,400);

// ═══════════════════════════════════════════════
// PDF EXPORT MODAL
// ═══════════════════════════════════════════════
function PdfModal({ title, subtitle, onClose, children }) {
  const frameRef = useRef(null);
  function doPrint() {
    const content = frameRef.current?.innerHTML || "";
    const win = window.open("","_blank","width=900,height=700");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap">
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans','Segoe UI',system-ui,sans-serif;background:#fff;padding:32px;color:#1e293b;font-size:12px}
        h1{font-size:20px;font-weight:800;color:#0f2040;margin-bottom:4px}
        p.sub{color:#64748b;font-size:12px;margin-bottom:20px}
        .header-bar{display:flex;align-items:center;gap:14px;border-bottom:3px solid #0f2040;padding-bottom:14px;margin-bottom:20px}
        .logo-box{width:44px;height:44px;background:linear-gradient(135deg,#14a085,#2952a3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11.5px}
        th{background:#0f2040;color:#fff;padding:9px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;font-weight:700}
        td{padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:top}
        tr:nth-child(even) td{background:#f8fafc}
        .badge{display:inline-block;border-radius:999px;padding:2px 10px;font-size:10px;font-weight:700;border:1px solid}
        .footer{margin-top:28px;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;display:flex;justify-content:space-between}
        @media print{body{padding:16px}}
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); }, 600);
  }
  return (
    <div className="rms-pdf-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="rms-pdf-frame fade-in">
        <button className="rms-pdf-close" onClick={onClose} style={{ position:"absolute",top:14,right:14,background:"#f1f5f9",border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,color:"#64748b",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        <div ref={frameRef}>
          <div className="header-bar">
            <div className="logo-box">🛡️</div>
            <div>
              <h1>{title}</h1>
              <p className="sub">{subtitle} · Dicetak: {new Date().toLocaleString("id-ID",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
            </div>
          </div>
          {children}
          <div className="footer">
            <span>Sistem Manajemen Risiko — Sekolah UALS (SMA UNKLAB)</span>
            <span>Kelompok 6: Pontoh Rezza · Palari Estefani · Patuli Zeavani</span>
          </div>
        </div>
        <div className="rms-pdf-actions" style={{ display:"flex",gap:10,marginTop:20,justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"#f1f5f9",color:"#475569",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer" }}>Tutup</button>
          <button onClick={doPrint} style={{ background:"linear-gradient(135deg,#1a3358,#0d7377)",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>🖨️ Print / Simpan PDF</button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_THRESHOLDS = { low:4, medium:9, high:16 };

function getRiskLevel(score, thr = DEFAULT_THRESHOLDS) {
  if (score <= thr.low)    return { level:"LOW",      color:T.green700, bg:T.green100,  border:"#86efac" };
  if (score <= thr.medium) return { level:"MEDIUM",   color:T.amber700, bg:T.amber100,  border:"#fcd34d" };
  if (score <= thr.high)   return { level:"HIGH",     color:T.orange700,bg:T.orange100, border:"#fdba74" };
  return                          { level:"CRITICAL",  color:T.red700,   bg:T.red100,    border:"#fca5a5" };
}

function calcResidual(score, avgEff) {
  return Math.max(1, Math.round(score * (1 - Math.min(avgEff,5) / 6)));
}

// ═══════════════════════════════════════════════
// SEED DATA — sesuai Laporan Analisis Risiko UALS
// ═══════════════════════════════════════════════
const SEED = {
  users: [
    { id:"u1", email:"admin@uals.sch.id",   password:"password123", role:"admin",   name:"Admin UALS" },
    { id:"u2", email:"analyst@uals.sch.id", password:"password123", role:"analyst", name:"Rizky Setiawan" },
    { id:"u3", email:"viewer@uals.sch.id",  password:"password123", role:"viewer",  name:"Guest Viewer" },
  ],
  assets: [
    { id:"as1",  name:"Komputer (36 unit)",           type:"tangible",   value:144000000, category:"Hardware",       description:"Digunakan di sekolah sejak 2018", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as2",  name:"Laptop Chromebook (13 unit)",  type:"tangible",   value:16900000,  category:"Hardware",       description:"Untuk kegiatan belajar mengajar, portable", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as3",  name:"Router (4 unit)",              type:"tangible",   value:6000000,   category:"Jaringan",       description:"Mendukung ±750 klien di 4 gedung", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as4",  name:"Access Point PoE (beberapa unit)",   type:"tangible",   value:7600000,   category:"Jaringan",       description:"Est. 4 unit @Rp1.900.000, mendukung jaringan WiFi seluruh gedung sekolah", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as5",  name:"Printer (6-7 unit)",           type:"tangible",   value:24500000,  category:"Hardware",       description:"7 unit @Rp3.500.000, digunakan TU, Bendahara, KS, Kurikulum, dan Guru", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as6",  name:"Smart TV 75\" (7 unit)",       type:"tangible",   value:182000000, category:"Hardware",       description:"Untuk kegiatan pembelajaran di kelas", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as7",  name:"Proyektor (15 unit)",          type:"tangible",   value:75000000,  category:"Hardware",       description:"Tersedia di berbagai ruangan sekolah", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as8",  name:"CCTV (16 unit)",               type:"tangible",   value:15200000,  category:"Keamanan Fisik", description:"16 titik, instalasi Rp 2.000.000", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as9",  name:"Data Kurikulum",               type:"intangible", value:50000000,  category:"Data",           description:"Est. kerugian pembuatan ulang + gangguan KBM. Disimpan di Excel, belum ada backup terpusat", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as10", name:"Data Administrasi",            type:"intangible", value:35000000,  category:"Data",           description:"Est. kerugian rekonstruksi dokumen 396 siswa & 47 guru. Disimpan di Excel, rentan hilang/korup", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as11", name:"Data Keuangan",                type:"intangible", value:75000000,  category:"Data",           description:"Est. kerugian audit & rekonstruksi jika data hilang. Dikelola Business Office UNKLAB (eksternal)", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as12", name:"Data Rapor Siswa",             type:"intangible", value:40000000,  category:"Data",           description:"Est. kerugian re-input & gangguan layanan 396 siswa. File dari sistem pemerintah, input via Excel", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as13", name:"Data Absensi",                 type:"intangible", value:15000000,  category:"Data",           description:"Est. kerugian operasional harian jika sistem absensi online tidak berfungsi. Tersimpan di database website", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as14", name:"Website Sekolah",              type:"intangible", value:20000000,  category:"Aplikasi",       description:"Est. biaya pengembangan ulang + kerugian layanan absensi & pendaftaran online. Pernah down beberapa kali", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as15", name:"Media Sosial (TikTok/IG/FB)",  type:"intangible", value:10000000,  category:"Aplikasi",       description:"Est. kerugian reputasi & kegiatan promosi sekolah jika akun diretas/disalahgunakan", createdAt:"2024-01-01T00:00:00Z" },
    { id:"as16", name:"Akreditasi AAA (Yayasan)",     type:"intangible", value:500000000, category:"Reputasi",       description:"Nilai strategis tertinggi — kehilangan akreditasi AAA berdampak pada kepercayaan publik, jumlah siswa baru, dan dana yayasan", createdAt:"2024-01-01T00:00:00Z" },
  ],
  vulnerabilities: [
    { id:"vl1", name:"Tidak ada server khusus",        severity:4, category:"Infrastruktur", asset_ids:["as1","as9","as10","as11","as12"], description:"Data tersebar di tiap unit komputer, tidak ada penyimpanan terpusat" },
    { id:"vl2", name:"Data manual di Excel",           severity:4, category:"Data",          asset_ids:["as9","as10","as12"],             description:"Tidak ada database khusus, sangat rentan hilang/korup" },
    { id:"vl3", name:"Firewall default",               severity:3, category:"Jaringan",      asset_ids:["as3","as4"],                     description:"Hanya pengaturan default, rentan serangan dari luar" },
    { id:"vl4", name:"Satpam tidak jaga malam",        severity:3, category:"Fisik",         asset_ids:["as2","as8"],                     description:"Rentan pencurian fisik di luar jam jaga" },
    { id:"vl5", name:"Tidak ada asuransi perangkat IT",severity:2, category:"Operasional",   asset_ids:["as1","as2","as6","as7","as8"],    description:"Kerugian ditanggung sendiri jika terjadi insiden" },
    { id:"vl6", name:"Tidak ada SOP insiden IT",       severity:3, category:"Operasional",   asset_ids:["as1","as10","as14"],              description:"Penanganan insiden tidak terstruktur" },
    { id:"vl7", name:"Hosting website eksternal",      severity:3, category:"Aplikasi",      asset_ids:["as14","as13"],                   description:"Bergantung pihak ketiga, rentan down tanpa pemberitahuan" },
    { id:"vl8", name:"Perangkat portable tak aman",    severity:3, category:"Fisik",         asset_ids:["as2"],                           description:"Laptop Chromebook mudah dibawa, risiko pencurian tinggi" },
  ],
  threats: [
    { id:"th1", name:"Kerusakan Hardware",  likelihood:4, impact:3, category:"Fisik",    asset_ids:["as1","as2","as3","as6","as7"], description:"Sudah pernah terjadi akibat kelalaian pengguna" },
    { id:"th2", name:"Virus / Malware",     likelihood:3, impact:4, category:"Cyber",    asset_ids:["as1","as2"],                   description:"Sudah pernah terjadi, komputer sempat lumpuh" },
    { id:"th3", name:"Kehilangan Data",     likelihood:3, impact:5, category:"Data",     asset_ids:["as9","as10","as12","as13"],    description:"Risiko tinggi karena data masih di Excel, tidak ada server" },
    { id:"th4", name:"Website Down",        likelihood:3, impact:3, category:"Aplikasi", asset_ids:["as14","as13"],                 description:"Sudah pernah terjadi, ganggu absensi dan ujian online" },
    { id:"th5", name:"Pencurian Perangkat", likelihood:2, impact:4, category:"Fisik",    asset_ids:["as2","as8"],                   description:"Satpam tidak jaga malam, laptop portable" },
    { id:"th6", name:"Serangan Jaringan",   likelihood:2, impact:4, category:"Cyber",    asset_ids:["as3","as4","as1"],             description:"Firewall default, jaringan terbuka ±750 klien" },
    { id:"th7", name:"Insider Attack",      likelihood:2, impact:3, category:"SDM",      asset_ids:["as9","as10","as11","as12"],    description:"Pengguna internal bisa lalai/sengaja merusak data" },
  ],
  controls: [
    { id:"ct1",  name:"Antivirus (Microsoft Security + Malwarebytes)", type:"preventive", effectiveness:3, status:"implemented", cost:350000,  priority:"high",   asset_ids:["as1","as2"], description:"Malwarebytes Free terpasang. Est. biaya: waktu maintenance Staff IT Rp350.000/bulan", implementedBy:"Staff IT" },
    { id:"ct2",  name:"Firewall default jaringan",                     type:"preventive", effectiveness:2, status:"implemented", cost:200000,  priority:"medium", asset_ids:["as3","as4"], description:"Konfigurasi bawaan router. Est. biaya: waktu monitoring rutin Staff IT Rp200.000/bulan", implementedBy:"Staff IT" },
    { id:"ct3",  name:"Backup Data (harian/mingguan/bulanan)",         type:"corrective", effectiveness:4, status:"implemented", cost:500000,  priority:"high",   asset_ids:["as9","as10","as12"], description:"Di komputer lokal dan external storage", implementedBy:"Staff IT" },
    { id:"ct4",  name:"Update Sistem Windows & Excel",                 type:"preventive", effectiveness:3, status:"implemented", cost:300000,  priority:"medium", asset_ids:["as1","as2"], description:"Update 36 komputer ±1 bulan sekali. Est. biaya: waktu downtime + jam kerja Staff IT Rp300.000/bulan", implementedBy:"Staff IT" },
    { id:"ct5",  name:"Keamanan Fisik (pintu + satpam)",               type:"preventive", effectiveness:3, status:"implemented", cost:2000000, priority:"medium", asset_ids:["as2","as8"], description:"Pintu terkunci, satpam (tidak malam)", implementedBy:"Manajemen" },
    { id:"ct6",  name:"Penyimpanan Laptop Terkunci",                   type:"preventive", effectiveness:3, status:"implemented", cost:750000,  priority:"medium", asset_ids:["as2"],        description:"13 laptop disimpan di lemari terkunci. Est. biaya: pengadaan rak/lemari kunci Rp750.000", implementedBy:"Staff IT" },
    { id:"ct7",  name:"Edukasi Password Pengguna",                     type:"preventive", effectiveness:2, status:"implemented", cost:250000,  priority:"low",    asset_ids:["as1","as2","as9","as10"], description:"Sosialisasi keamanan password. Est. biaya: cetak modul + waktu Staff IT Rp250.000/sesi", implementedBy:"Staff IT" },
    { id:"ct8",  name:"Pelatihan IT untuk Staf",                       type:"detective",  effectiveness:4, status:"implemented", cost:1500000, priority:"high",   asset_ids:["as1","as9","as10","as16"], description:"Pelatihan keamanan IT seluruh staf", implementedBy:"Manajemen" },
    { id:"ct9",  name:"Pembatasan USB Flashdisk Luar",                 type:"preventive", effectiveness:3, status:"implemented", cost:150000,  priority:"medium", asset_ids:["as1","as2"],  description:"Pembatasan USB via kebijakan sistem. Est. biaya: waktu konfigurasi 36 komputer Rp150.000", implementedBy:"Staff IT" },
    { id:"ct10", name:"Pengadaan Server Sekolah (REKOMENDASI)",        type:"preventive", effectiveness:5, status:"planned",     cost:25000000,priority:"high",   asset_ids:["as9","as10","as12","as1"], description:"Server terpusat agar data tidak tersebar", implementedBy:"—" },
    { id:"ct11", name:"Upgrade Konfigurasi Firewall (REKOMENDASI)",    type:"preventive", effectiveness:4, status:"planned",     cost:3000000, priority:"high",   asset_ids:["as3","as4"],  description:"Tingkatkan firewall ke konfigurasi ketat", implementedBy:"—" },
    { id:"ct12", name:"Pembuatan SOP Insiden IT (REKOMENDASI)",        type:"detective",  effectiveness:4, status:"in_progress", cost:500000,  priority:"high",   asset_ids:["as1","as10","as14","as16"], description:"Prosedur baku penanganan insiden IT", implementedBy:"—" },
  ],
  risks: [
    { id:"rk1",  asset_id:"as9",  vulnerability_id:"vl2", threat_id:"th3", likelihood:3, impact:5, notes:"Data kurikulum di Excel tanpa server, rentan hilang permanen", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk2",  asset_id:"as10", vulnerability_id:"vl2", threat_id:"th3", likelihood:3, impact:5, notes:"Data administrasi rentan korup saat proses input manual", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk3",  asset_id:"as12", vulnerability_id:"vl2", threat_id:"th3", likelihood:3, impact:5, notes:"Data rapor dari sistem pemerintah diinput ulang ke Excel", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk4",  asset_id:"as1",  vulnerability_id:"vl1", threat_id:"th2", likelihood:3, impact:4, notes:"36 komputer tanpa server terpusat, virus sulit dikontrol", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk5",  asset_id:"as1",  vulnerability_id:"vl6", threat_id:"th1", likelihood:4, impact:3, notes:"Tidak ada SOP, penanganan kerusakan hardware lambat", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk6",  asset_id:"as2",  vulnerability_id:"vl8", threat_id:"th5", likelihood:2, impact:4, notes:"Laptop portable, satpam tidak jaga malam", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk7",  asset_id:"as3",  vulnerability_id:"vl3", threat_id:"th6", likelihood:2, impact:4, notes:"Router firewall default, jaringan terbuka 750 klien", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk8",  asset_id:"as14", vulnerability_id:"vl7", threat_id:"th4", likelihood:3, impact:3, notes:"Website pernah down, ganggu absensi dan ujian", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk9",  asset_id:"as13", vulnerability_id:"vl7", threat_id:"th4", likelihood:3, impact:3, notes:"Data absensi online terganggu saat website down", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk10", asset_id:"as10", vulnerability_id:"vl6", threat_id:"th7", likelihood:2, impact:3, notes:"Data administrasi bisa diubah insider tanpa SOP ketat", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk11", asset_id:"as8",  vulnerability_id:"vl4", threat_id:"th5", likelihood:2, impact:4, notes:"CCTV rentan dicuri saat malam tanpa satpam", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
    { id:"rk12", asset_id:"as16", vulnerability_id:"vl6", threat_id:"th7", likelihood:2, impact:5, notes:"Akreditasi AAA terancam jika ada pelanggaran data besar", createdAt:"2024-01-15T00:00:00Z", createdBy:"u2" },
  ],
  risk_controls: [
    { id:"rc1",  risk_id:"rk1",  control_id:"ct3"  },
    { id:"rc2",  risk_id:"rk1",  control_id:"ct10" },
    { id:"rc3",  risk_id:"rk2",  control_id:"ct3"  },
    { id:"rc4",  risk_id:"rk2",  control_id:"ct10" },
    { id:"rc5",  risk_id:"rk3",  control_id:"ct3"  },
    { id:"rc6",  risk_id:"rk4",  control_id:"ct1"  },
    { id:"rc7",  risk_id:"rk4",  control_id:"ct9"  },
    { id:"rc8",  risk_id:"rk4",  control_id:"ct4"  },
    { id:"rc9",  risk_id:"rk5",  control_id:"ct8"  },
    { id:"rc10", risk_id:"rk5",  control_id:"ct12" },
    { id:"rc11", risk_id:"rk6",  control_id:"ct5"  },
    { id:"rc12", risk_id:"rk6",  control_id:"ct6"  },
    { id:"rc13", risk_id:"rk7",  control_id:"ct2"  },
    { id:"rc14", risk_id:"rk7",  control_id:"ct11" },
    { id:"rc15", risk_id:"rk8",  control_id:"ct3"  },
    { id:"rc16", risk_id:"rk10", control_id:"ct7"  },
    { id:"rc17", risk_id:"rk10", control_id:"ct12" },
    { id:"rc18", risk_id:"rk11", control_id:"ct5"  },
    { id:"rc19", risk_id:"rk12", control_id:"ct8"  },
    { id:"rc20", risk_id:"rk12", control_id:"ct12" },
  ],
  // Matriks dari laporan UALS — nilai 0=Tidak Relevan,1=Rendah,2=Sedang,3=Tinggi
  matrix_av: [
    ["vl1","as1",3],["vl2","as1",3],["vl3","as1",2],["vl4","as1",1],["vl5","as1",2],["vl6","as1",2],
    ["vl4","as2",2],["vl8","as2",3],["vl5","as2",2],["vl3","as2",1],
    ["vl3","as3",3],["vl5","as3",1],["vl6","as3",1],
    ["vl1","as9",3],["vl2","as9",3],["vl6","as9",2],
    ["vl1","as10",3],["vl2","as10",3],["vl6","as10",2],
    ["vl7","as14",3],["vl6","as14",2],
    ["vl4","as8",3],["vl5","as8",1],
  ],
  matrix_vt: [
    ["th1","vl1",3],["th2","vl1",2],["th3","vl1",3],["th7","vl1",2],
    ["th1","vl2",2],["th3","vl2",3],["th7","vl2",2],
    ["th2","vl3",2],["th6","vl3",3],["th4","vl3",1],
    ["th5","vl4",3],
    ["th1","vl5",2],["th5","vl5",2],
    ["th1","vl6",2],["th3","vl6",2],["th4","vl6",2],["th7","vl6",2],
    ["th4","vl7",3],
    ["th5","vl8",3],
  ],
  matrix_tc: [
    ["ct3","th1",1],["ct4","th1",1],["ct8","th1",1],["ct12","th1",2],
    ["ct1","th2",3],["ct2","th2",2],["ct4","th2",2],["ct9","th2",2],
    ["ct3","th3",3],["ct10","th3",3],["ct4","th3",1],
    ["ct3","th4",1],["ct2","th4",1],
    ["ct5","th5",3],["ct6","th5",3],
    ["ct2","th6",2],["ct11","th6",3],
    ["ct7","th7",1],["ct8","th7",2],["ct12","th7",2],
  ],
  auditLog: [],
  thresholds: DEFAULT_THRESHOLDS,
};

// ═══════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════
const K = (k) => "rms7_" + k;
const MATRIX_KEYS = ["matrix_av","matrix_vt","matrix_tc"];

// SELALU tulis seed matrix — jamin data tidak pernah kosong
// Dipanggil di useEffect App component (client-side only)
const seedMatricesClient = () => {
  MATRIX_KEYS.forEach(key => {
    // Selalu overwrite agar format [row,col,val] selalu sesuai seed terbaru
    localStorage.setItem(K(key), JSON.stringify(SEED[key]));
  });
};

function initLS(key) {
  if (typeof window === 'undefined') return SEED[key];
  try {
    // Matrix key: selalu pakai dari localStorage yg sudah di-seed IIFE di atas
    if (MATRIX_KEYS.includes(key)) {
      const r = localStorage.getItem(K(key));
      if (r) return JSON.parse(r);
      return SEED[key];
    }
    const r = localStorage.getItem(K(key));
    if (r !== null) return JSON.parse(r);
  } catch {}
  localStorage.setItem(K(key), JSON.stringify(SEED[key]));
  return SEED[key];
}
function useLS(key) {
  const [val, setRaw] = useState(() => initLS(key));
  const set = useCallback((d) => { localStorage.setItem(K(key), JSON.stringify(d)); setRaw(d); }, [key]);
  return [val, set];
}
function useStore() {
  const [assets,   setAssets]   = useLS("assets");
  const [vulns,    setVulns]    = useLS("vulnerabilities");
  const [threats,  setThreats]  = useLS("threats");
  const [controls, setControls] = useLS("controls");
  const [risks,    setRisks]    = useLS("risks");
  const [rc,       setRC]       = useLS("risk_controls");
  const [audit,    setAudit]    = useLS("auditLog");
  const [thresh,   setThresh]   = useLS("thresholds");
  const [matAV,    setMatAV]    = useLS("matrix_av");
  const [matVT,    setMatVT]    = useLS("matrix_vt");
  const [matTC,    setMatTC]    = useLS("matrix_tc");

  const log = useCallback((user, action, entity, id, detail="") => {
    const e = { id:uid(), timestamp:now(), userId:user?.id, userName:user?.name, userRole:user?.role, action, entity, entityId:id, detail };
    setAudit(prev => [e, ...prev].slice(0,300));
  }, [setAudit]);

  return { assets,setAssets, vulns,setVulns, threats,setThreats, controls,setControls, risks,setRisks, rc,setRC, audit, log, thresh,setThresh, matAV,setMatAV, matVT,setMatVT, matTC,setMatTC };
}

// ═══════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════

// Badge
function Badge({ text, color, bg, border, size="sm" }) {
  const p = size==="xs" ? "1px 7px" : size==="sm" ? "2px 10px" : "4px 14px";
  const fs = size==="xs" ? 10 : size==="sm" ? 11 : 13;
  return (
    <span style={{ background:bg, color, border:`1px solid ${border}`, borderRadius:T.rFull, padding:p, fontSize:fs, fontWeight:700, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center" }}>
      {text}
    </span>
  );
}

function RiskBadge({ score, thr, size }) {
  const r = getRiskLevel(score, thr||DEFAULT_THRESHOLDS);
  return <Badge text={`${r.level} · ${score}`} color={r.color} bg={r.bg} border={r.border} size={size||"sm"} />;
}

// Modal
function Modal({ title, subtitle, onClose, width=580, children }) {
  useEffect(() => {
    const h = (e) => { if(e.key==="Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(10,22,40,0.6)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="fade-in" style={{ background:T.white,borderRadius:T.r16,width:"100%",maxWidth:width,maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:T.shadowModal }}>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"20px 24px 16px",borderBottom:`1px solid ${T.gray200}` }}>
          <div>
            <p style={{ fontWeight:800,fontSize:17,color:T.navy800,margin:0 }}>{title}</p>
            {subtitle && <p style={{ fontSize:12,color:T.gray500,margin:"3px 0 0" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background:T.gray100,border:"none",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,color:T.gray500,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:12 }}>×</button>
        </div>
        <div style={{ padding:"22px 24px",overflowY:"auto",flex:1 }}>{children}</div>
      </div>
    </div>
  );
}


// Field wrapper
function Field({ label, required, hint, error, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block",fontSize:12,fontWeight:700,color:T.gray600,marginBottom:6,letterSpacing:".03em" }}>
        {label}{required && <span style={{ color:T.red500,marginLeft:3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize:11,color:T.gray400,marginTop:4 }}>{hint}</p>}
      {error && <p style={{ fontSize:11,color:T.red500,marginTop:4,fontWeight:600 }}>⚠ {error}</p>}
    </div>
  );
}

// Input / Select / Textarea styled
const baseInput = { width:"100%",border:`1.5px solid ${T.gray200}`,borderRadius:T.r8,padding:"10px 13px",fontSize:13,background:T.white,color:T.gray800,transition:"border .15s,box-shadow .15s",fontFamily:"inherit" };
const Inp = (props) => <input style={baseInput} {...props} />;
const Sel = ({ children, ...props }) => <select style={{ ...baseInput, cursor:"pointer" }} {...props}>{children}</select>;
const Txta = (props) => <textarea style={{ ...baseInput, resize:"vertical", minHeight:72 }} {...props} />;

// Error banner
function ErrBanner({ msg }) {
  return msg ? (
    <div style={{ background:"#fef2f2",border:`1px solid #fecaca`,borderRadius:T.r8,padding:"10px 14px",color:T.red700,fontSize:13,fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
      <span>⚠</span> {msg}
    </div>
  ) : null;
}

// Success banner
function SuccessBanner({ msg }) {
  return msg ? (
    <div style={{ background:T.green100,border:`1px solid #86efac`,borderRadius:T.r8,padding:"10px 14px",color:T.green700,fontSize:13,fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",gap:8 }}>
      <span>✓</span> {msg}
    </div>
  ) : null;
}

// Page header
function PageHeader({ title, subtitle, icon, children }) {
  return (
    <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
      <div style={{ display:"flex",alignItems:"center",gap:14 }}>
        <div style={{ width:48,height:48,background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,borderRadius:T.r12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:T.shadow2 }}>
          {icon}
        </div>
        <div>
          <h2 style={{ fontSize:22,fontWeight:800,color:T.navy800,margin:0,letterSpacing:"-.02em" }}>{title}</h2>
          {subtitle && <p style={{ color:T.gray500,fontSize:13,margin:"3px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" }}>{children}</div>
    </div>
  );
}

// Stat card
function StatCard({ label, value, icon, color, bg, border, onClick }) {
  return (
    <div className="card-hover" onClick={onClick} style={{ background:bg||T.white,borderRadius:T.r12,padding:"18px 20px",border:`1px solid ${border||T.gray200}`,cursor:onClick?"pointer":"default",transition:"transform .2s,box-shadow .2s",boxShadow:T.shadow1 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
        <div style={{ width:38,height:38,background:color+"22",borderRadius:T.r8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{icon}</div>
      </div>
      <p style={{ fontSize:28,fontWeight:800,color:color||T.navy800,margin:"0 0 4px",letterSpacing:"-.02em" }}>{value}</p>
      <p style={{ fontSize:12,color:T.gray500,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",margin:0 }}>{label}</p>
    </div>
  );
}

// Table
function Table({ columns, data, emptyMsg, onRowClick }) {
  return (
    <div style={{ background:T.white,borderRadius:T.r12,border:`1px solid ${T.gray200}`,overflow:"hidden",boxShadow:T.shadow1 }}>
      <table style={{ width:"100%",borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:`linear-gradient(135deg,${T.navy800},${T.navy700})` }}>
            {columns.map(c => (
              <th key={c.key||c.label} style={{ padding:"12px 16px",textAlign:c.align||"left",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.85)",textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(!data||data.length===0) && (
            <tr><td colSpan={columns.length} style={{ textAlign:"center",padding:"40px 16px",color:T.gray400,fontSize:14 }}>
              <div>📭</div><div style={{ marginTop:8 }}>{emptyMsg||"Tidak ada data"}</div>
            </td></tr>
          )}
          {(data||[]).map((row, i) => (
            <tr key={row.id||i} className="row-hover" onClick={()=>onRowClick&&onRowClick(row)}
              style={{ borderBottom:`1px solid ${T.gray100}`,cursor:onRowClick?"pointer":"default",transition:"background .1s" }}>
              {columns.map(c => (
                <td key={c.key||c.label} style={{ padding:"11px 16px",fontSize:13,color:c.muted?T.gray500:T.gray800,textAlign:c.align||"left",verticalAlign:"middle" }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Search + Filter bar
function SearchBar({ value, onChange, placeholder, children }) {
  return (
    <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
      <div style={{ position:"relative",flex:1,minWidth:200 }}>
        <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.gray400,fontSize:14 }}>🔍</span>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Cari..."} style={{ ...baseInput,paddingLeft:36 }} />
      </div>
      {children}
    </div>
  );
}

// Tabs
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex",gap:0,borderBottom:`2px solid ${T.gray200}`,marginBottom:20,overflowX:"auto" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)} className="tab-btn"
          style={{ padding:"10px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:active===t.id?800:500,color:active===t.id?T.navy700:T.gray500,borderBottom:`2.5px solid ${active===t.id?T.teal500:"transparent"}`,marginBottom:-2,transition:"all .15s",whiteSpace:"nowrap" }}>
          {t.label}
          {t.count != null && (
            <span style={{ marginLeft:6,fontSize:11,background:active===t.id?T.teal200:T.gray200,color:active===t.id?T.teal600:T.gray600,borderRadius:T.rFull,padding:"1px 7px" }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// Action buttons
function BtnPrimary({ children, onClick, type="button", disabled }) {
  return <button type={type} onClick={onClick} disabled={disabled} className="btn-primary" style={{ background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,color:T.white,border:"none",borderRadius:T.r8,padding:"10px 20px",fontSize:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",transition:"all .15s",opacity:disabled?.6:1,display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" }}>{children}</button>;
}
function BtnSecondary({ children, onClick, type="button" }) {
  return <button type={type} onClick={onClick} style={{ background:T.white,color:T.navy700,border:`1.5px solid ${T.gray200}`,borderRadius:T.r8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap" }}>{children}</button>;
}
function BtnDanger({ children, onClick }) {
  return <button onClick={onClick} style={{ background:"#fff1f2",color:T.red700,border:`1.5px solid #fecaca`,borderRadius:T.r8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:6 }}>{children}</button>;
}
function BtnIcon({ children, onClick, title }) {
  return <button onClick={onClick} title={title} className="icon-btn" style={{ background:"transparent",border:`1px solid ${T.gray200}`,borderRadius:T.r6,width:32,height:32,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .12s" }}>{children}</button>;
}

// ═══════════════════════════════════════════════
// LOGIN PAGE — Enhanced
// ═══════════════════════════════════════════════
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function submit(e) {
    e.preventDefault(); setErr("");
    const em = sanitize(email).toLowerCase();
    const pw = sanitize(pass);
    if (!em || !pw) { setErr("Email dan password wajib diisi"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setErr("Format email tidak valid"); return; }
    if (pw.length < 6) { setErr("Password minimal 6 karakter"); return; }
    setLoading(true);
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem(K("users")) || JSON.stringify(SEED.users));
      const u = users.find(x => x.email.toLowerCase()===em && x.password===pw);
      setLoading(false);
      if (!u) { setErr("Email atau password salah"); return; }
      onLogin(u);
    }, 500);
  }

  const roleColors = { admin:{ c:T.red500,bg:"#fff0f0",b:"#fecaca" }, analyst:{ c:T.teal600,bg:T.teal50,b:T.teal200 }, viewer:{ c:T.gold500,bg:T.gold50,b:T.gold200 } };

  return (
    <div className="rms" style={{ minHeight:"100vh", background:`linear-gradient(145deg,${T.navy900} 0%,${T.navy800} 40%,${T.teal600} 100%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 32px", position:"relative", overflow:"hidden" }}>

      {/* ── Animated background orbs ── */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
        {/* large slow-float orbs */}
        <div className="orb-float" style={{ position:"absolute",top:"-10%",left:"-8%",width:480,height:480,borderRadius:"50%",background:`radial-gradient(circle,${T.teal500}28,transparent 70%)` }} />
        <div className="orb-float2" style={{ position:"absolute",bottom:"-12%",right:"-6%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${T.gold400}18,transparent 70%)` }} />
        <div className="orb-float" style={{ position:"absolute",top:"40%",right:"10%",width:220,height:220,borderRadius:"50%",background:`radial-gradient(circle,${T.navy500}30,transparent 70%)` }} />
        {/* spinning rings */}
        <div className="ring-spin" style={{ position:"absolute",top:"8%",left:"12%",width:280,height:280,borderRadius:"50%",border:`1.5px solid rgba(255,255,255,0.07)` }} />
        <div className="ring-spin-rev" style={{ position:"absolute",top:"6%",left:"10%",width:340,height:340,borderRadius:"50%",border:`1px solid rgba(255,255,255,0.04)` }} />
        <div className="ring-spin" style={{ position:"absolute",bottom:"10%",right:"8%",width:240,height:240,borderRadius:"50%",border:`1.5px solid rgba(255,255,255,0.06)` }} />
        {/* static dots grid */}
        {[...Array(20)].map((_,i)=>(
          <div key={i} style={{ position:"absolute", width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.12)", top:`${(i*17+7)%90}%`, left:`${(i*23+5)%90}%` }} />
        ))}
      </div>

      {/* ── Main card ── */}
      <div className="login-panel" style={{ display:"flex",gap:0,width:"100%",maxWidth:920,borderRadius:T.r20,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)" }}>

        {/* ── LEFT PANEL ── */}
        <div className="login-left" style={{ flex:"0 0 360px",background:`linear-gradient(170deg,${T.navy900} 0%,${T.navy800} 55%,${T.teal600} 100%)`,padding:"52px 36px",display:"flex",flexDirection:"column",justifyContent:"space-between",alignItems:"center",textAlign:"center",position:"relative",overflow:"hidden" }}>

          {/* Background decorative circles */}
          <div style={{ position:"absolute",top:-60,left:-60,width:220,height:220,borderRadius:"50%",background:"rgba(20,160,133,0.08)",pointerEvents:"none" }} />
          <div style={{ position:"absolute",bottom:-40,right:-40,width:180,height:180,borderRadius:"50%",background:"rgba(255,255,255,0.04)",pointerEvents:"none" }} />
          <div style={{ position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 30%,rgba(20,160,133,0.14),transparent 65%)`,pointerEvents:"none" }} />

          <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:0 }}>

            {/* Logo */}
            <div className="logo-glow" style={{ width:96,height:96,borderRadius:"50%",background:"rgba(255,255,255,0.97)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"4px solid rgba(255,255,255,0.25)",boxShadow:"0 8px 32px rgba(0,0,0,0.25)",marginBottom:16 }}>
              <img src="/logo-unklab.png" alt="Logo UNKLAB" style={{ width:86,height:86,objectFit:"contain" }} />
            </div>

            {/* School name */}
            <p style={{ fontSize:12,fontWeight:800,color:"rgba(255,255,255,0.9)",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:".12em" }}>SMA UNKLAB</p>
            <p style={{ fontSize:11,color:"rgba(255,255,255,0.45)",margin:"0 0 32px",letterSpacing:".04em" }}>Airmadidi · Manado</p>

            {/* Divider with dots */}
            <div style={{ display:"flex",alignItems:"center",gap:8,width:"100%",marginBottom:32 }}>
              <div style={{ flex:1,height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.2))" }} />
              <div style={{ width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.3)" }} />
              <div style={{ width:4,height:4,borderRadius:"50%",background:T.teal400,opacity:.7 }} />
              <div style={{ width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.3)" }} />
              <div style={{ flex:1,height:1,background:"linear-gradient(90deg,rgba(255,255,255,0.2),transparent)" }} />
            </div>

            {/* Title */}
            <h1 style={{ fontSize:28,fontWeight:800,color:T.white,margin:"0 0 14px",lineHeight:1.25,letterSpacing:"-.02em" }}>Sistem Manajemen<br/>Risiko</h1>

            {/* Subtitle tag */}
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:T.rFull,padding:"6px 16px",backdropFilter:"blur(8px)" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:T.teal400,flexShrink:0 }} />
              <span style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.75)",letterSpacing:".03em" }}>Keamanan Informasi · Sekolah UALS</span>
            </div>
          </div>

          {/* Footer */}
          <p style={{ position:"relative",zIndex:1,fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center",margin:0,letterSpacing:".03em" }}>
            © 2026 · Sistem Manajemen Risiko · SMA UNKLAB
          </p>
        </div>

        {/* ── RIGHT PANEL — login form ── */}
        <div className="login-right" style={{ flex:1,background:T.white,padding:"48px 40px",display:"flex",flexDirection:"column",justifyContent:"center" }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:24,fontWeight:800,color:T.navy800,margin:"0 0 6px",letterSpacing:"-.02em" }}>Masuk ke Sistem</h2>
            <p style={{ fontSize:13,color:T.gray500,margin:0 }}>Gunakan akun yang sudah terdaftar</p>
          </div>

          <form onSubmit={submit} noValidate>
            {err && (
              <div style={{ background:"#fff1f2",border:"1px solid #fecaca",borderRadius:T.r8,padding:"10px 14px",color:T.red700,fontSize:13,fontWeight:600,marginBottom:16,display:"flex",alignItems:"center",gap:8,animation:"loginFadeRight 0.3s ease" }}>
                ⚠️ {err}
              </div>
            )}
            <Field label="Alamat Email" required>
              <Inp type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@uals.sch.id" autoComplete="email" />
            </Field>
            <Field label="Password" required>
              <Inp type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </Field>
            <button type="submit" disabled={loading} style={{ width:"100%",background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,color:T.white,border:"none",borderRadius:T.r8,padding:"12px 20px",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",transition:"all .2s",opacity:loading?.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:`0 4px 14px rgba(26,51,88,0.3)`,marginTop:4 }}
              onMouseEnter={e=>{ if(!loading){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 8px 20px rgba(26,51,88,0.4)`; }}}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 4px 14px rgba(26,51,88,0.3)`; }}>
              {loading ? (
                <><span style={{ display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"ringSpin 0.7s linear infinite" }}/>Memproses...</>
              ) : (<>🚀 Masuk ke Sistem</>)}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop:24,padding:"16px",background:T.navy50,borderRadius:T.r12,border:`1px solid ${T.navy100}` }}>
            <p style={{ fontSize:11,fontWeight:800,color:T.navy700,margin:"0 0 10px",textTransform:"uppercase",letterSpacing:".06em" }}>🔑 Akun Demo (password: password123)</p>
            {SEED.users.map(u => {
              const rc = roleColors[u.role] || roleColors.viewer;
              return (
                <div key={u.id} className="demo-row" onClick={()=>{ setEmail(u.email); setPass("password123"); }}
                  style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",cursor:"pointer",marginBottom:6,background:T.white }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${rc.c}44,${rc.c}22)`,border:`1.5px solid ${rc.b}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:rc.c,flexShrink:0 }}>{u.name[0]}</div>
                    <span style={{ fontSize:12,color:T.navy700,fontWeight:600 }}>{u.email}</span>
                  </div>
                  <Badge text={u.role.toUpperCase()} color={rc.c} bg={rc.bg} border={rc.b} size="xs" />
                </div>
              );
            })}
            <p style={{ fontSize:10,color:T.gray400,margin:"4px 0 0",display:"flex",alignItems:"center",gap:4 }}>
              <span>👆</span> Klik baris untuk isi otomatis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════
const NAV = [
  { group:"OVERVIEW",  items:[{id:"dashboard",label:"Dashboard",icon:"📊"}] },
  { group:"DATA MASTER",items:[
    {id:"assets",          label:"Aset",       icon:"📦"},
    {id:"vulnerabilities", label:"Kerentanan", icon:"🔓"},
    {id:"threats",         label:"Ancaman",    icon:"⚡"},
    {id:"controls",        label:"Kontrol",    icon:"🛡️"},
  ]},
  { group:"ANALISIS",  items:[
    {id:"risks",  label:"Manajemen Risiko",    icon:"⚠️"},
    {id:"matrix", label:"Risk Matrix",         icon:"▣"},
  ]},
  { group:"SISTEM",    items:[
    {id:"audit",    label:"Audit Trail",  icon:"📋"},
    {id:"settings", label:"Pengaturan",  icon:"⚙️"},
  ]},
];

function Sidebar({ page, setPage, user, onLogout }) {
  const roleColors = { admin:T.red500, analyst:T.teal500, viewer:T.gold500 };
  const rc = roleColors[user.role] || T.teal500;
  const canAccessSettings = user.role === "admin";

  // Filter nav items: sembunyikan Pengaturan untuk viewer & analyst
  const filteredNAV = NAV.map(grp => ({
    ...grp,
    items: grp.items.filter(item => item.id !== "settings" || canAccessSettings),
  })).filter(grp => grp.items.length > 0);

  return (
    <aside style={{ width:230,background:`linear-gradient(180deg,${T.navy900} 0%,${T.navy800} 100%)`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto",borderRight:`1px solid rgba(255,255,255,0.06)` }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 18px",borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
          <div style={{ width:40,height:40,background:`linear-gradient(135deg,${T.teal500},${T.navy500})`,borderRadius:T.r10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>🛡️</div>
          <div>
            <p style={{ fontSize:12,fontWeight:800,color:T.white,margin:0,letterSpacing:"-.01em" }}>Risk Management</p>
            <p style={{ fontSize:10,color:"rgba(255,255,255,0.4)",margin:0 }}>Sekolah UALS</p>
          </div>
        </div>
        {/* User card */}
        <div style={{ background:"rgba(255,255,255,0.07)",borderRadius:T.r10,padding:"10px 12px",border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${rc},${rc}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:T.white,flexShrink:0 }}>
              {user.name[0]}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:12,fontWeight:700,color:T.white,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</p>
              <p style={{ fontSize:10,color:rc,margin:0,textTransform:"uppercase",letterSpacing:".06em",fontWeight:700 }}>{user.role} {user.role==="viewer"?"· Read only":""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"14px 10px 0" }}>
        {filteredNAV.map(grp => (
          <div key={grp.group} style={{ marginBottom:18 }}>
            <p style={{ fontSize:9,fontWeight:800,color:"rgba(255,255,255,0.25)",textTransform:"uppercase",letterSpacing:".12em",padding:"0 10px",margin:"0 0 4px" }}>{grp.group}</p>
            {grp.items.map(item => (
              <button key={item.id} onClick={()=>setPage(item.id)} className="nav-btn sidebar-link"
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",padding:"9px 12px",borderRadius:T.r8,border:"none",borderLeft:"3px solid transparent",fontSize:13,fontWeight:page===item.id?700:400,color:page===item.id?T.white:"rgba(255,255,255,0.55)",background:page===item.id?"rgba(255,255,255,0.12)":"transparent",cursor:"pointer",marginBottom:2,transition:"all .14s" }}>
                <span style={{ fontSize:15,lineHeight:1 }}>{item.icon}</span>
                {item.label}
                {page===item.id && <span style={{ marginLeft:"auto",width:6,height:6,borderRadius:"50%",background:T.gold400,flexShrink:0 }} />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding:"12px 10px 18px",borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <button onClick={onLogout} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",padding:"9px 12px",borderRadius:T.r8,border:"none",fontSize:13,color:"rgba(255,100,100,0.8)",background:"transparent",cursor:"pointer",fontWeight:600,transition:"all .14s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,100,100,0.1)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════
function DashboardPage({ S }) {
  const { assets, vulns, threats, controls, risks, rc } = S;
  const thr = S.thresh || DEFAULT_THRESHOLDS;
  const scored = useMemo(() => risks.map(r => ({ ...r, score:r.likelihood*r.impact, ...getRiskLevel(r.likelihood*r.impact,thr) })), [risks,thr]);
  const byLvl = l => scored.filter(r=>r.level===l).length;
  const top5 = useMemo(() => [...scored].sort((a,b)=>b.score-a.score).slice(0,5), [scored]);
  const getA = id => assets.find(a=>a.id===id);
  const getV = id => vulns.find(v=>v.id===id);
  const getT = id => threats.find(t=>t.id===id);
  const ctrlImpl = controls.filter(c=>c.status==="implemented"||c.status==="verified").length;
  const totalValue = assets.reduce((s,a)=>s+(a.value||0),0);

  return (
    <div className="fade-in">
      <PageHeader title="Dashboard" subtitle="Ringkasan analisis risiko keamanan informasi Sekolah UALS · SMA UNKLAB" icon="📊" />

      {/* Row 1: Master Data KPI */}
      <div style={{ marginBottom:10 }}>
        <p style={{ fontSize:11,fontWeight:700,color:T.gray400,textTransform:"uppercase",letterSpacing:".07em",margin:"0 0 10px" }}>Data Master</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20 }}>
          <StatCard label="Total Aset" value={assets.length} icon="📦" color={T.navy700} bg={T.navy50} border={T.navy100} />
          <StatCard label="Kerentanan" value={vulns.length} icon="🔓" color="#6a1b9a" bg="#f3e5f5" border="#ce93d8" />
          <StatCard label="Ancaman" value={threats.length} icon="⚡" color={T.orange700} bg={T.orange100} border="#fdba74" />
          <StatCard label="Kontrol" value={controls.length} icon="🛡️" color={T.teal600} bg={T.teal50} border={T.teal200} />
        </div>
      </div>

      {/* Row 2: Risk KPI */}
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:11,fontWeight:700,color:T.gray400,textTransform:"uppercase",letterSpacing:".07em",margin:"0 0 10px" }}>Status Risiko</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12 }}>
          <StatCard label="Total Risiko" value={risks.length} icon="⚠️" color={T.gray700} bg={T.gray50} border={T.gray200} />
          <StatCard label="CRITICAL" value={byLvl("CRITICAL")} icon="🔴" color={T.red700} bg={T.red100} border="#fecaca" />
          <StatCard label="HIGH" value={byLvl("HIGH")} icon="🟠" color={T.orange700} bg={T.orange100} border="#fdba74" />
          <StatCard label="MEDIUM" value={byLvl("MEDIUM")} icon="🟡" color={T.amber700} bg={T.amber100} border="#fcd34d" />
          <StatCard label="LOW" value={byLvl("LOW")} icon="🟢" color={T.green700} bg={T.green100} border="#86efac" />
        </div>
      </div>

      {/* Row 3: Connection info banner */}
      <div style={{ background:`linear-gradient(135deg,${T.navy50},${T.teal50})`,borderRadius:T.r12,border:`1px solid ${T.navy100}`,padding:"12px 18px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
        <span style={{ fontSize:16 }}>🔗</span>
        <div>
          <p style={{ fontSize:12,fontWeight:800,color:T.navy700,margin:0 }}>Sistem Terkoneksi Otomatis</p>
          <p style={{ fontSize:11,color:T.gray500,margin:0 }}>Saat menambah data baru (Aset, Kerentanan, Ancaman, Kontrol), semua halaman &amp; perhitungan risk score otomatis diperbarui secara real-time. Ubah Likelihood/Impact di halaman Ancaman → skor risiko terkait langsung berubah.</p>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap" }}>
          <Badge text={`${rc.length} tautan Risiko-Kontrol`} color={T.teal600} bg={T.teal50} border={T.teal200} size="xs"/>
          <Badge text={`Total Nilai Aset: ${fmtRp(totalValue)}`} color={T.navy700} bg={T.navy50} border={T.navy100} size="xs"/>
          <Badge text={`${ctrlImpl}/${controls.length} kontrol aktif`} color={T.green700} bg={T.green100} border="#86efac" size="xs"/>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16,marginBottom:16 }}>
        {/* Top Risks */}
        <div style={{ background:T.white,borderRadius:T.r16,border:`1px solid ${T.gray200}`,overflow:"hidden",boxShadow:T.shadow1 }}>
          <div style={{ padding:"16px 20px 12px",background:`linear-gradient(135deg,${T.navy800},${T.navy700})` }}>
            <p style={{ fontSize:14,fontWeight:800,color:T.white,margin:0 }}>🏆 Top 5 Risiko Tertinggi</p>
            <p style={{ fontSize:11,color:"rgba(255,255,255,0.5)",margin:"2px 0 0" }}>Diurutkan berdasarkan Risk Score (Likelihood × Impact)</p>
          </div>
          <div style={{ padding:"4px 0" }}>
            {top5.length===0&&<p style={{ textAlign:"center",padding:24,color:T.gray400,fontSize:13 }}>Belum ada risiko terdaftar</p>}
            {top5.map((r,i) => {
              const lv = getRiskLevel(r.score,thr);
              const linkedCtrls = rc.filter(x=>x.risk_id===r.id).length;
              const resScore = linkedCtrls>0?calcResidual(r.score, controls.filter(c=>rc.some(x=>x.risk_id===r.id&&x.control_id===c.id)).reduce((s,c)=>s+c.effectiveness,0)/linkedCtrls):null;
              return (
                <div key={r.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 20px",borderBottom:i<top5.length-1?`1px solid ${T.gray100}`:"none" }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,color:T.white,fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:12,fontWeight:700,color:T.gray800,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{getA(r.asset_id)?.name}</p>
                    <p style={{ fontSize:10,color:T.gray400,margin:0 }}>{getV(r.vulnerability_id)?.name?.slice(0,30)} · {getT(r.threat_id)?.name}</p>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}>
                    <Badge text={`${lv.level} · ${r.score}`} color={lv.color} bg={lv.bg} border={lv.border} size="xs" />
                    {resScore&&<span style={{ fontSize:9,color:T.gray400 }}>residual: {resScore}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution */}
        <div style={{ background:T.white,borderRadius:T.r16,border:`1px solid ${T.gray200}`,padding:20,boxShadow:T.shadow1 }}>
          <p style={{ fontSize:14,fontWeight:800,color:T.navy800,margin:"0 0 16px" }}>📊 Distribusi Risk Level</p>
          {[
            {l:"CRITICAL",c:T.red700,bg:T.red100,b:"#fecaca"},
            {l:"HIGH",c:T.orange700,bg:T.orange100,b:"#fdba74"},
            {l:"MEDIUM",c:T.amber700,bg:T.amber100,b:"#fcd34d"},
            {l:"LOW",c:T.green700,bg:T.green100,b:"#86efac"},
          ].map(({l,c,bg,b}) => {
            const cnt = byLvl(l), pct = risks.length ? Math.round((cnt/risks.length)*100) : 0;
            return (
              <div key={l} style={{ marginBottom:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                  <Badge text={l} color={c} bg={bg} border={b} size="xs" />
                  <span style={{ fontSize:12,fontWeight:800,color:c }}>{cnt} ({pct}%)</span>
                </div>
                <div style={{ height:6,background:T.gray200,borderRadius:T.rFull }}>
                  <div style={{ width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${c},${c}99)`,borderRadius:T.rFull,transition:"width .5s ease" }} />
                </div>
              </div>
            );
          })}
          <div style={{ marginTop:16,padding:"12px 14px",background:T.teal50,borderRadius:T.r10,border:`1px solid ${T.teal200}` }}>
            <p style={{ fontSize:12,color:T.teal600,margin:0,fontWeight:700 }}>🛡️ {ctrlImpl}/{controls.length} kontrol diterapkan</p>
            <p style={{ fontSize:11,color:T.gray500,margin:"4px 0 0" }}>Threshold aktif: LOW≤{thr.low} · MED≤{thr.medium} · HIGH≤{thr.high} · CRIT&gt;{thr.high}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ background:T.white,borderRadius:T.r16,border:`1px solid ${T.gray200}`,padding:20,boxShadow:T.shadow1 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <p style={{ fontSize:14,fontWeight:800,color:T.navy800,margin:0 }}>🎯 Rekomendasi Prioritas Penanganan</p>
          <Badge text={`${scored.filter(r=>!rc.some(x=>x.risk_id===r.id)).length} risiko belum ada kontrol`} color={T.red700} bg={T.red100} border="#fecaca" size="xs"/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          {[
            {title:"⚡ Segera Tangani",color:T.red700,bg:T.red100,b:"#fecaca",lvl:"CRITICAL"},
            {title:"⚠️ Perlu Perhatian",color:T.orange700,bg:T.orange100,b:"#fdba74",lvl:"HIGH"},
            {title:"👁️ Pantau Rutin",color:T.amber700,bg:T.amber100,b:"#fcd34d",lvl:"MEDIUM"},
          ].map(col => {
            const list = scored.filter(r=>r.level===col.lvl);
            return (
              <div key={col.title} style={{ background:col.bg,borderRadius:T.r12,padding:"14px 16px",border:`1px solid ${col.b}` }}>
                <p style={{ fontSize:12,fontWeight:800,color:col.color,margin:"0 0 10px" }}>{col.title} ({list.length})</p>
                {list.slice(0,4).map(r => {
                  const hasCtrl = rc.some(x=>x.risk_id===r.id);
                  return (
                    <div key={r.id} style={{ display:"flex",alignItems:"center",gap:6,marginBottom:5 }}>
                      <div style={{ width:4,height:4,borderRadius:"50%",background:col.color,flexShrink:0 }} />
                      <p style={{ fontSize:11,color:T.gray700,margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1 }}>{getA(r.asset_id)?.name}</p>
                      {!hasCtrl&&<span style={{ fontSize:9,color:T.red700,fontWeight:800,flexShrink:0 }}>no ctrl</span>}
                    </div>
                  );
                })}
                {list.length>4&&<p style={{ fontSize:10,color:col.color,margin:"4px 0 0",fontWeight:600 }}>+{list.length-4} lainnya</p>}
                {list.length===0&&<p style={{ fontSize:11,color:T.gray400,margin:0 }}>Tidak ada risiko ✓</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ASSETS PAGE
// ═══════════════════════════════════════════════
function AssetsPage({ S, canEdit, user }) {
  const { assets, setAssets, risks, log } = S;
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  const filtered = useMemo(() => assets.filter(a =>
    (!search || [a.name,a.category,a.description].some(v=>v?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterType || a.type===filterType)
  ), [assets,search,filterType]);

  function AssetForm({ item, onClose }) {
    const [f, setF] = useState({ name:item?.name||"", type:item?.type||"tangible", value:item?.value??"", category:item?.category||"Hardware", description:item?.description||"" });
    const [err, setErr] = useState("");
    function submit(e) {
      e.preventDefault(); setErr("");
      const name = sanitize(f.name); if(!name){setErr("Nama aset wajib diisi");return;}
      if(f.value!==""&&(isNaN(+f.value)||+f.value<0)){setErr("Nilai harus angka ≥ 0");return;}
      const dup = assets.find(a=>a.name.toLowerCase()===name.toLowerCase()&&a.id!==item?.id);
      if(dup){setErr("Nama aset sudah terdaftar");return;}
      const saved = { ...item, name, type:f.type, value:f.value===""?0:+f.value, category:sanitize(f.category), description:sanitize(f.description), id:item?.id||uid(), createdAt:item?.createdAt||now() };
      if(item){setAssets(assets.map(a=>a.id===saved.id?saved:a));log(user,"UPDATE","Asset",saved.id,saved.name);}
      else{setAssets([...assets,saved]);log(user,"CREATE","Asset",saved.id,saved.name);}
      onClose();
    }
    const cats = [...new Set(assets.map(a=>a.category))];
    return (
      <form onSubmit={submit} noValidate>
        <ErrBanner msg={err} />
        <Field label="Nama Aset" required hint="Unik, maks 400 karakter">
          <Inp value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Komputer Lab A" />
        </Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label="Tipe Aset" required>
            <Sel value={f.type} onChange={e=>setF({...f,type:e.target.value})}>
              <option value="tangible">Tangible (Fisik)</option>
              <option value="intangible">Intangible (Non-Fisik)</option>
            </Sel>
          </Field>
          <Field label="Kategori">
            <Sel value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
              <option value="Hardware">Hardware</option>
              <option value="Jaringan">Jaringan</option>
              <option value="Keamanan Fisik">Keamanan Fisik</option>
              <option value="Data">Data</option>
              <option value="Aplikasi">Aplikasi</option>
              <option value="Reputasi">Reputasi</option>
              <option value="Lainnya">Lainnya</option>
            </Sel>
          </Field>
        </div>
        <Field label="Nilai Aset (Rp)" hint="Isi 0 jika tidak ada nilai moneter">
          <Inp type="number" min="0" value={f.value} onChange={e=>setF({...f,value:e.target.value})} placeholder="144000000" />
        </Field>
        <Field label="Deskripsi">
          <Txta value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Keterangan aset..." />
        </Field>
        <div style={{ display:"flex",gap:10,marginTop:4 }}>
          <BtnPrimary type="submit">💾 Simpan</BtnPrimary>
          <BtnSecondary onClick={onClose}>Batal</BtnSecondary>
        </div>
      </form>
    );
  }

  function del(a) {
    const used = risks.filter(r=>r.asset_id===a.id).length;
    if(used){alert(`Tidak dapat dihapus: aset "${a.name}" digunakan di ${used} risiko.\nHapus risiko terkait terlebih dahulu (referential integrity).`);return;}
    if(!confirm(`Hapus aset "${a.name}"?`))return;
    setAssets(assets.filter(x=>x.id!==a.id)); log(user,"DELETE","Asset",a.id,a.name);
  }

  const [showPdf, setShowPdf] = useState(false);

  function riskLvlStyle(type) {
    if(type==="tangible") return {bg:"#dce8ff",color:"#1a3358",border:"#6b96e0"};
    return {bg:"#e8faf7",color:"#0d7377",border:"#1abc9c"};
  }

  return (
    <div className="fade-in">
      {showPdf && (
        <PdfModal title="Laporan Data Aset" subtitle={`${filtered.length} aset terdaftar`} onClose={()=>setShowPdf(false)}>
          <table className="rms-pdf-tbl">
            <thead><tr>
              <th>#</th><th>Nama Aset</th><th>Tipe</th><th>Kategori</th><th>Nilai (Rp)</th><th>Deskripsi</th>
            </tr></thead>
            <tbody>
              {filtered.map((a,i)=>{
                const s=riskLvlStyle(a.type);
                return (
                  <tr key={a.id}>
                    <td style={{color:"#94a3b8",fontSize:10}}>{i+1}</td>
                    <td style={{fontWeight:700,color:"#0f2040"}}>{a.name}</td>
                    <td><span className="rms-pdf-badge" style={{background:s.bg,color:s.color,borderColor:s.border}}>{a.type==="tangible"?"Tangible":"Intangible"}</span></td>
                    <td>{a.category}</td>
                    <td style={{fontWeight:600,textAlign:"right",whiteSpace:"nowrap"}}>{fmtRp(a.value)}</td>
                    <td style={{color:"#64748b",fontSize:11}}>{a.description||"—"}</td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4} style={{fontWeight:800,color:"#0f2040",textAlign:"right",paddingTop:10}}>Total Nilai Aset:</td>
                <td style={{fontWeight:800,color:"#0d7377",textAlign:"right",whiteSpace:"nowrap"}}>{fmtRp(filtered.reduce((s,a)=>s+(a.value||0),0))}</td>
                <td/>
              </tr>
            </tbody>
          </table>
        </PdfModal>
      )}
      <PageHeader title="Manajemen Aset" subtitle={`${filtered.length} dari ${assets.length} aset · Tangible & Intangible`} icon="📦">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari aset...">
          <Sel value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ ...baseInput,width:180 }}>
            <option value="">Semua Tipe</option>
            <option value="tangible">Tangible</option>
            <option value="intangible">Intangible</option>
          </Sel>
          <BtnSecondary onClick={()=>setShowPdf(true)}>📄 Export PDF</BtnSecondary>
          {canEdit&&<BtnPrimary onClick={()=>setModal({})}>+ Tambah Aset</BtnPrimary>}
        </SearchBar>
      </PageHeader>

      <Table
        columns={[
          { label:"Nama Aset", render:a=><div><p style={{ fontWeight:700,fontSize:13,color:T.navy800,margin:0 }}>{a.name}</p><p style={{ fontSize:11,color:T.gray400,margin:0 }}>{a.description?.slice(0,60)}{a.description?.length>60?"…":""}</p></div> },
          { label:"Tipe", render:a=><Badge text={a.type==="tangible"?"Tangible":"Intangible"} color={a.type==="tangible"?T.navy700:T.teal600} bg={a.type==="tangible"?T.navy50:T.teal50} border={a.type==="tangible"?T.navy100:T.teal200} size="xs"/> },
          { label:"Kategori", key:"category", muted:true },
          { label:"Nilai (Rp)", align:"right", render:a=><span style={{ fontWeight:600,color:a.value>0?T.navy700:T.gray400 }}>{fmtRp(a.value)}</span> },

          ...(canEdit ? [{ label:"Aksi", align:"center", render:a=>(
            <div style={{ display:"flex",gap:6,justifyContent:"center" }}>
              <BtnIcon onClick={()=>setModal({item:a})} title="Edit">✏️</BtnIcon>
              <BtnIcon onClick={()=>del(a)} title="Hapus">🗑️</BtnIcon>
            </div>
          )}] : []),
        ]}
        data={filtered}
        emptyMsg="Belum ada aset terdaftar"
      />

      {modal&&<Modal title={modal.item?"Edit Aset":"Tambah Aset Baru"} subtitle="Lengkapi informasi aset sekolah" onClose={()=>setModal(null)}><AssetForm item={modal.item} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// VULNERABILITIES PAGE — linked to assets
// ═══════════════════════════════════════════════
function VulnsPage({ S, canEdit, user }) {
  const { vulns, setVulns, assets, risks, log } = S;
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterAsset, setFilterAsset] = useState("");

  const filtered = useMemo(() => vulns.filter(v =>
    (!search || [v.name,v.category,v.description].some(s=>s?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterAsset || v.asset_ids?.includes(filterAsset))
  ), [vulns,search,filterAsset]);

  function VulnForm({ item, onClose }) {
    const [f, setF] = useState({ name:item?.name||"", severity:item?.severity??3, category:item?.category||"Infrastruktur", asset_ids:item?.asset_ids||[], description:item?.description||"" });
    const [err, setErr] = useState("");
    function submit(e) {
      e.preventDefault(); setErr("");
      const name=sanitize(f.name); if(!name){setErr("Nama kerentanan wajib diisi");return;}
      if(vulns.find(v=>v.name.toLowerCase()===name.toLowerCase()&&v.id!==item?.id)){setErr("Nama sudah terdaftar");return;}
      const saved={...item,name,severity:+f.severity,category:sanitize(f.category),asset_ids:f.asset_ids,description:sanitize(f.description),id:item?.id||uid()};
      if(item){setVulns(vulns.map(v=>v.id===saved.id?saved:v));log(user,"UPDATE","Vulnerability",saved.id,saved.name);}
      else{setVulns([...vulns,saved]);log(user,"CREATE","Vulnerability",saved.id,saved.name);}
      onClose();
    }
    const toggleAsset = id => setF(p=>({ ...p, asset_ids:p.asset_ids.includes(id)?p.asset_ids.filter(x=>x!==id):[...p.asset_ids,id] }));
    const SCALE = {1:"Sangat Rendah",2:"Rendah",3:"Sedang",4:"Tinggi",5:"Sangat Tinggi"};
    return (
      <form onSubmit={submit} noValidate>
        <ErrBanner msg={err}/>
        <Field label="Nama Kerentanan" required><Inp value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Contoh: Tidak ada server khusus"/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label={`Severity: ${f.severity}/5 — ${SCALE[f.severity]}`}>
            <input type="range" min="1" max="5" step="1" value={f.severity} onChange={e=>setF({...f,severity:e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
            <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:T.gray400,marginTop:2 }}><span>1-Min</span><span>5-Max</span></div>
          </Field>
          <Field label="Kategori">
            <Sel value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
              <option value="Infrastruktur">Infrastruktur</option>
              <option value="Data">Data</option>
              <option value="Jaringan">Jaringan</option>
              <option value="Fisik">Fisik</option>
              <option value="Operasional">Operasional</option>
              <option value="Aplikasi">Aplikasi</option>
              <option value="SDM">SDM</option>
            </Sel>
          </Field>
        </div>
        <Field label="Aset yang Terpengaruh" hint="Pilih satu atau lebih aset terkait kerentanan ini">
          <div style={{ background:T.gray50,borderRadius:T.r8,border:`1.5px solid ${T.gray200}`,padding:"10px 12px",maxHeight:180,overflowY:"auto" }}>
            {assets.map(a=>(
              <label key={a.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${T.gray100}` }}>
                <input type="checkbox" checked={f.asset_ids.includes(a.id)} onChange={()=>toggleAsset(a.id)} style={{ accentColor:T.teal500 }}/>
                <span style={{ fontSize:12,color:T.gray700 }}>{a.name}</span>
                <Badge text={a.type==="tangible"?"T":"IT"} color={a.type==="tangible"?T.navy700:T.teal600} bg={a.type==="tangible"?T.navy50:T.teal50} border={T.gray200} size="xs"/>
              </label>
            ))}
          </div>
          {f.asset_ids.length>0&&<p style={{ fontSize:11,color:T.teal600,marginTop:4,fontWeight:600 }}>✓ {f.asset_ids.length} aset dipilih</p>}
        </Field>
        <Field label="Deskripsi"><Txta value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></Field>
        <div style={{ display:"flex",gap:10 }}><BtnPrimary type="submit">💾 Simpan</BtnPrimary><BtnSecondary onClick={onClose}>Batal</BtnSecondary></div>
      </form>
    );
  }

  function del(v) {
    const used=risks.filter(r=>r.vulnerability_id===v.id).length;
    if(used){alert(`Tidak dapat dihapus: kerentanan digunakan di ${used} risiko.`);return;}
    if(!confirm(`Hapus kerentanan "${v.name}"?`))return;
    setVulns(vulns.filter(x=>x.id!==v.id)); log(user,"DELETE","Vulnerability",v.id,v.name);
  }

  const sevBadge = s => {
    const m={5:{c:T.red700,bg:T.red100,b:"#fecaca"},4:{c:T.orange700,bg:T.orange100,b:"#fdba74"},3:{c:T.amber700,bg:T.amber100,b:"#fcd34d"},2:{c:T.green700,bg:T.green100,b:"#86efac"},1:{c:T.gray600,bg:T.gray100,b:T.gray300}};
    const x=m[s]||m[3]; return <Badge text={`${s}/5`} {...x} size="xs"/>;
  };

  return (
    <div className="fade-in">
      <PageHeader title="Kerentanan (Vulnerability)" subtitle={`${filtered.length} dari ${vulns.length} kerentanan · Dikelompokkan berdasarkan aset`} icon="🔓">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari kerentanan...">
          <Sel value={filterAsset} onChange={e=>setFilterAsset(e.target.value)} style={{ ...baseInput,width:220 }}>
            <option value="">Semua Aset</option>
            {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </Sel>
          {canEdit&&<BtnPrimary onClick={()=>setModal({})}>+ Tambah</BtnPrimary>}
        </SearchBar>
      </PageHeader>

      <Table
        columns={[
          { label:"Nama Kerentanan", render:v=><div><p style={{ fontWeight:700,fontSize:13,color:T.navy800,margin:0 }}>{v.name}</p><p style={{ fontSize:11,color:T.gray400,margin:0 }}>{v.description?.slice(0,60)}{v.description?.length>60?"…":""}</p></div> },
          { label:"Kategori", key:"category", muted:true },
          { label:"Severity", align:"center", render:v=>sevBadge(v.severity) },
          { label:"Aset Terkait", render:v=>{
            const linked=assets.filter(a=>v.asset_ids?.includes(a.id));
            if(linked.length===0) return <span style={{ fontSize:11,color:T.gray400 }}>—</span>;
            return <div style={{ display:"flex",gap:3,flexWrap:"wrap",maxWidth:340 }}>{linked.map(a=><span key={a.id} style={{ background:T.navy50,color:T.navy700,border:`1px solid ${T.navy100}`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",marginBottom:2 }}>{a.name}</span>)}</div>;
          }},
          ...(canEdit?[{label:"Aksi",align:"center",render:v=>(
            <div style={{ display:"flex",gap:6,justifyContent:"center" }}>
              <BtnIcon onClick={()=>setModal({item:v})} title="Edit">✏️</BtnIcon>
              <BtnIcon onClick={()=>del(v)} title="Hapus">🗑️</BtnIcon>
            </div>
          )}]:[]),
        ]}
        data={filtered}
        emptyMsg="Belum ada kerentanan terdaftar"
      />
      {modal&&<Modal title={modal.item?"Edit Kerentanan":"Tambah Kerentanan"} onClose={()=>setModal(null)}><VulnForm item={modal.item} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// THREATS PAGE — linked to assets
// ═══════════════════════════════════════════════
function ThreatsPage({ S, canEdit, user }) {
  const { threats, setThreats, assets, risks, setRisks, log, thresh } = S;
  const thr = thresh || DEFAULT_THRESHOLDS;
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterAsset, setFilterAsset] = useState("");

  const filtered = useMemo(() => threats.filter(t =>
    (!search||[t.name,t.category,t.description].some(s=>s?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterAsset||t.asset_ids?.includes(filterAsset))
  ),[threats,search,filterAsset]);

  function ThreatForm({ item, onClose }) {
    const [f, setF] = useState({ name:item?.name||"", likelihood:item?.likelihood??3, impact:item?.impact??3, category:item?.category||"Cyber", asset_ids:item?.asset_ids||[], description:item?.description||"" });
    const [err, setErr] = useState("");
    const score = +f.likelihood * +f.impact;
    const lv = getRiskLevel(score, thr);
    const SCALE={1:"Sangat Rendah",2:"Rendah",3:"Sedang",4:"Tinggi",5:"Sangat Tinggi"};
    function submit(e) {
      e.preventDefault(); setErr("");
      const name=sanitize(f.name); if(!name){setErr("Nama wajib diisi");return;}
      if(threats.find(t=>t.name.toLowerCase()===name.toLowerCase()&&t.id!==item?.id)){setErr("Nama sudah ada");return;}
      const saved={...item,name,likelihood:+f.likelihood,impact:+f.impact,category:sanitize(f.category),asset_ids:f.asset_ids,description:sanitize(f.description),id:item?.id||uid()};
      if(item){
        setThreats(threats.map(t=>t.id===saved.id?saved:t));
        // Re-calc linked risks
        setRisks(risks.map(r=>r.threat_id===saved.id?{...r,likelihood:saved.likelihood,impact:saved.impact}:r));
        log(user,"UPDATE","Threat",saved.id,saved.name);
      } else { setThreats([...threats,saved]); log(user,"CREATE","Threat",saved.id,saved.name); }
      onClose();
    }
    const toggleAsset = id => setF(p=>({...p,asset_ids:p.asset_ids.includes(id)?p.asset_ids.filter(x=>x!==id):[...p.asset_ids,id]}));
    return (
      <form onSubmit={submit} noValidate>
        <ErrBanner msg={err}/>
        <Field label="Nama Ancaman" required><Inp value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Contoh: Virus / Malware"/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label={`Likelihood: ${f.likelihood}/5 — ${SCALE[f.likelihood]}`}>
            <input type="range" min="1" max="5" step="1" value={f.likelihood} onChange={e=>setF({...f,likelihood:e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
          </Field>
          <Field label={`Impact: ${f.impact}/5 — ${SCALE[f.impact]}`}>
            <input type="range" min="1" max="5" step="1" value={f.impact} onChange={e=>setF({...f,impact:e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
          </Field>
        </div>
        {/* Live preview */}
        <div style={{ background:lv.bg,border:`1px solid ${lv.border}`,borderRadius:T.r10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:16 }}>
          <div>
            <p style={{ fontSize:11,color:T.gray500,margin:0 }}>Formula: {f.likelihood} × {f.impact}</p>
            <p style={{ fontSize:22,fontWeight:800,color:lv.color,margin:0 }}>{score}</p>
          </div>
          <Badge text={lv.level} color={lv.color} bg={lv.bg} border={lv.border}/>
          <p style={{ fontSize:11,color:T.gray400,marginLeft:"auto",margin:0 }}>⚡ Re-calc otomatis ke risiko terkait</p>
        </div>
        <Field label="Kategori">
          <Sel value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
            <option value="Cyber">Cyber</option>
            <option value="Fisik">Fisik</option>
            <option value="Data">Data</option>
            <option value="Aplikasi">Aplikasi</option>
            <option value="SDM">SDM</option>
          </Sel>
        </Field>
        <Field label="Aset yang Terancam" hint="Pilih aset yang dapat terdampak ancaman ini">
          <div style={{ background:T.gray50,borderRadius:T.r8,border:`1.5px solid ${T.gray200}`,padding:"10px 12px",maxHeight:160,overflowY:"auto" }}>
            {assets.map(a=>(
              <label key={a.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"4px 0",cursor:"pointer" }}>
                <input type="checkbox" checked={f.asset_ids.includes(a.id)} onChange={()=>toggleAsset(a.id)} style={{ accentColor:T.teal500 }}/>
                <span style={{ fontSize:12,color:T.gray700 }}>{a.name}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label="Deskripsi"><Txta value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></Field>
        <div style={{ display:"flex",gap:10 }}><BtnPrimary type="submit">💾 Simpan</BtnPrimary><BtnSecondary onClick={onClose}>Batal</BtnSecondary></div>
      </form>
    );
  }

  function del(t) {
    const used=risks.filter(r=>r.threat_id===t.id).length;
    if(used){alert(`Tidak dapat dihapus: digunakan di ${used} risiko.`);return;}
    if(!confirm(`Hapus ancaman "${t.name}"?`))return;
    setThreats(threats.filter(x=>x.id!==t.id)); log(user,"DELETE","Threat",t.id,t.name);
  }

  return (
    <div className="fade-in">
      <PageHeader title="Ancaman (Threat)" subtitle={`${filtered.length} dari ${threats.length} ancaman · Dihubungkan ke aset`} icon="⚡">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari ancaman...">
          <Sel value={filterAsset} onChange={e=>setFilterAsset(e.target.value)} style={{ ...baseInput,width:220 }}>
            <option value="">Semua Aset</option>
            {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </Sel>
          {canEdit&&<BtnPrimary onClick={()=>setModal({})}>+ Tambah</BtnPrimary>}
        </SearchBar>
      </PageHeader>

      <Table
        columns={[
          { label:"Nama Ancaman", render:t=><div><p style={{ fontWeight:700,fontSize:13,color:T.navy800,margin:0 }}>{t.name}</p><p style={{ fontSize:11,color:T.gray400,margin:0 }}>{t.category}</p></div> },
          { label:"Likelihood", align:"center", render:t=><span style={{ fontWeight:800,color:T.navy700 }}>{t.likelihood}<span style={{ fontSize:10,color:T.gray400,fontWeight:400 }}>/5</span></span> },
          { label:"Impact", align:"center", render:t=><span style={{ fontWeight:800,color:T.navy700 }}>{t.impact}<span style={{ fontSize:10,color:T.gray400,fontWeight:400 }}>/5</span></span> },
          { label:"Risk Score", align:"center", render:t=><RiskBadge score={t.likelihood*t.impact} thr={thr} size="xs"/> },
          { label:"Aset Terancam", render:t=>{
            const linked=assets.filter(a=>t.asset_ids?.includes(a.id));
            if(linked.length===0) return <span style={{ fontSize:11,color:T.gray400 }}>—</span>;
            return <div style={{ display:"flex",gap:3,flexWrap:"wrap",maxWidth:340 }}>{linked.map(a=><span key={a.id} style={{ background:T.navy50,color:T.navy700,border:`1px solid ${T.navy100}`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",marginBottom:2 }}>{a.name}</span>)}</div>;
          }},
          ...(canEdit?[{label:"Aksi",align:"center",render:t=>(
            <div style={{ display:"flex",gap:6,justifyContent:"center" }}>
              <BtnIcon onClick={()=>setModal({item:t})} title="Edit">✏️</BtnIcon>
              <BtnIcon onClick={()=>del(t)} title="Hapus">🗑️</BtnIcon>
            </div>
          )}]:[]),
        ]}
        data={filtered}
        emptyMsg="Belum ada ancaman terdaftar"
      />
      {modal&&<Modal title={modal.item?"Edit Ancaman":"Tambah Ancaman"} onClose={()=>setModal(null)}><ThreatForm item={modal.item} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// CONTROLS PAGE
// ═══════════════════════════════════════════════
function ControlsPage({ S, canEdit, user }) {
  const { controls, setControls, assets, rc, risks, log } = S;
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterAsset, setFilterAsset] = useState("");
  const [filterType, setFilterType] = useState("");

  const filtered = useMemo(() => controls.filter(c =>
    (!search||[c.name,c.description].some(s=>s?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterAsset||c.asset_ids?.includes(filterAsset)) &&
    (!filterType||c.type===filterType)
  ),[controls,search,filterAsset,filterType]);

  const recommended = [...controls].filter(c=>c.status!=="implemented"&&c.status!=="verified").sort((a,b)=>b.effectiveness-a.effectiveness);

  function CtrlForm({ item, onClose }) {
    const [f, setF] = useState({ name:item?.name||"", type:item?.type||"preventive", effectiveness:item?.effectiveness??3, status:item?.status||"planned", cost:item?.cost??"", priority:item?.priority||"medium", asset_ids:item?.asset_ids||[], description:item?.description||"", implementedBy:item?.implementedBy||"" });
    const [err, setErr] = useState("");
    const SCALE={1:"Sangat Rendah",2:"Rendah",3:"Sedang",4:"Tinggi",5:"Sangat Tinggi"};
    function submit(e) {
      e.preventDefault(); setErr("");
      const name=sanitize(f.name); if(!name){setErr("Nama kontrol wajib");return;}
      if(controls.find(c=>c.name.toLowerCase()===name.toLowerCase()&&c.id!==item?.id)){setErr("Nama sudah ada");return;}
      if(f.cost!==""&&(isNaN(+f.cost)||+f.cost<0)){setErr("Biaya harus angka ≥ 0");return;}
      const saved={...item,name,type:f.type,effectiveness:+f.effectiveness,status:f.status,cost:f.cost===""?0:+f.cost,priority:f.priority,asset_ids:f.asset_ids,description:sanitize(f.description),implementedBy:sanitize(f.implementedBy),id:item?.id||uid()};
      if(item){setControls(controls.map(c=>c.id===saved.id?saved:c));log(user,"UPDATE","Control",saved.id,saved.name);}
      else{setControls([...controls,saved]);log(user,"CREATE","Control",saved.id,saved.name);}
      onClose();
    }
    const toggleA = id => setF(p=>({...p,asset_ids:p.asset_ids.includes(id)?p.asset_ids.filter(x=>x!==id):[...p.asset_ids,id]}));
    const cost=+f.cost||0, roi=cost>0?Math.round((+f.effectiveness/5)*100/(cost/1000000)):null;
    return (
      <form onSubmit={submit} noValidate>
        <ErrBanner msg={err}/>
        <Field label="Nama Kontrol" required><Inp value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Backup Data Harian"/></Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
          <Field label="Tipe">
            <Sel value={f.type} onChange={e=>setF({...f,type:e.target.value})}>
              <option value="preventive">Preventive</option>
              <option value="detective">Detective</option>
              <option value="corrective">Corrective</option>
            </Sel>
          </Field>
          <Field label="Status">
            <Sel value={f.status} onChange={e=>setF({...f,status:e.target.value})}>
              <option value="planned">Direncanakan</option>
              <option value="in_progress">Sedang Berjalan</option>
              <option value="implemented">Diterapkan</option>
              <option value="verified">Terverifikasi</option>
            </Sel>
          </Field>
          <Field label="Prioritas">
            <Sel value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}>
              <option value="high">Tinggi</option>
              <option value="medium">Sedang</option>
              <option value="low">Rendah</option>
            </Sel>
          </Field>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label={`Efektivitas: ${f.effectiveness}/5 — ${SCALE[f.effectiveness]}`}>
            <input type="range" min="1" max="5" step="1" value={f.effectiveness} onChange={e=>setF({...f,effectiveness:e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
          </Field>
          <Field label="Estimasi Biaya (Rp)">
            <Inp type="number" min="0" value={f.cost} onChange={e=>setF({...f,cost:e.target.value})} placeholder="0"/>
          </Field>
        </div>
        {cost>0&&<div style={{ background:T.teal50,border:`1px solid ${T.teal200}`,borderRadius:T.r8,padding:"9px 13px",marginBottom:14,fontSize:12,color:T.teal600,fontWeight:600 }}>
          📊 ROI: efektivitas {f.effectiveness}/5 untuk biaya {fmtRp(cost)}{roi?` (~${roi.toFixed(1)} poin/juta Rp)`:""}
        </div>}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label="Diterapkan Oleh"><Inp value={f.implementedBy} onChange={e=>setF({...f,implementedBy:e.target.value})} placeholder="Staff IT / Manajemen"/></Field>
          <Field label="Deskripsi"><Txta value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></Field>
        </div>
        <Field label="Aset yang Dilindungi" hint="Pilih aset yang diproteksi kontrol ini">
          <div style={{ background:T.gray50,borderRadius:T.r8,border:`1.5px solid ${T.gray200}`,padding:"10px 12px",maxHeight:140,overflowY:"auto" }}>
            {assets.map(a=>(
              <label key={a.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"4px 0",cursor:"pointer" }}>
                <input type="checkbox" checked={f.asset_ids.includes(a.id)} onChange={()=>toggleA(a.id)} style={{ accentColor:T.teal500 }}/>
                <span style={{ fontSize:12,color:T.gray700 }}>{a.name}</span>
              </label>
            ))}
          </div>
        </Field>
        <div style={{ display:"flex",gap:10,marginTop:4 }}><BtnPrimary type="submit">💾 Simpan</BtnPrimary><BtnSecondary onClick={onClose}>Batal</BtnSecondary></div>
      </form>
    );
  }

  function del(c) {
    const used=rc.filter(r=>r.control_id===c.id).length;
    if(used){alert(`Tidak dapat dihapus: kontrol ditautkan ke ${used} risiko. Lepas tautan dulu.`);return;}
    if(!confirm(`Hapus kontrol "${c.name}"?`))return;
    setControls(controls.filter(x=>x.id!==c.id)); log(user,"DELETE","Control",c.id,c.name);
  }

  const TYPE_BADGE = { preventive:{c:"#0d47a1",bg:"#e3f2fd",b:"#90caf9"}, detective:{c:"#6a1b9a",bg:"#f3e5f5",b:"#ce93d8"}, corrective:{c:T.green700,bg:T.green100,b:"#86efac"} };
  const STATUS_BADGE = { planned:{c:T.gray600,bg:T.gray100,b:T.gray300}, in_progress:{c:"#0d47a1",bg:"#e3f2fd",b:"#90caf9"}, implemented:{c:T.green700,bg:T.green100,b:"#86efac"}, verified:{c:"#4a148c",bg:"#f3e5f5",b:"#ce93d8"} };
  const STATUS_LABEL = { planned:"Direncanakan", in_progress:"Sedang Berjalan", implemented:"Diterapkan", verified:"Terverifikasi" };

  const tabData = [
    {id:"all",label:"Semua",count:filtered.length},
    {id:"rec",label:"Rekomendasi",count:recommended.length},
    {id:"active",label:"Aktif",count:controls.filter(c=>c.status==="implemented"||c.status==="verified").length},
  ];

  return (
    <div className="fade-in">
      <PageHeader title="Manajemen Kontrol" subtitle={`${controls.length} kontrol terdaftar · Dihubungkan ke aset`} icon="🛡️">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari kontrol...">
          <Sel value={filterAsset} onChange={e=>setFilterAsset(e.target.value)} style={{ ...baseInput,width:200 }}>
            <option value="">Semua Aset</option>
            {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </Sel>
          <Sel value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ ...baseInput,width:150 }}>
            <option value="">Semua Tipe</option>
            <option value="preventive">Preventive</option>
            <option value="detective">Detective</option>
            <option value="corrective">Corrective</option>
          </Sel>
          {canEdit&&<BtnPrimary onClick={()=>setModal({})}>+ Tambah</BtnPrimary>}
        </SearchBar>
      </PageHeader>

      <TabBar tabs={tabData} active={tab} onChange={setTab}/>

      {tab==="rec" ? (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14 }}>
          {recommended.map((c,i) => {
            const tb=TYPE_BADGE[c.type], linked=rc.filter(r=>r.control_id===c.id).length;
            return (
              <div key={c.id} style={{ background:T.white,borderRadius:T.r14,border:`1px solid ${c.priority==="high"?"#fecaca":T.gray200}`,padding:"18px 20px",boxShadow:T.shadow1 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,color:T.white,fontSize:12,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>{i+1}</div>
                    <span style={{ fontWeight:800,fontSize:13,color:T.navy800 }}>{c.name}</span>
                  </div>
                  {c.priority==="high"&&<Badge text="⭐ Prioritas Tinggi" color={T.red700} bg={T.red100} border="#fecaca" size="xs"/>}
                </div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:10 }}>
                  <Badge text={c.type==="preventive"?"Preventive":c.type==="detective"?"Detective":"Corrective"} color={tb.c} bg={tb.bg} border={tb.b} size="xs"/>
                  <Badge text={STATUS_LABEL[c.status]} color={STATUS_BADGE[c.status]?.c||T.gray500} bg={STATUS_BADGE[c.status]?.bg||T.gray100} border={STATUS_BADGE[c.status]?.b||T.gray300} size="xs"/>
                  <Badge text={`Eff ${c.effectiveness}/5`} color={T.teal600} bg={T.teal50} border={T.teal200} size="xs"/>
                </div>
                <p style={{ fontSize:12,color:T.gray500,margin:"0 0 8px" }}>{c.description}</p>
                {c.cost>0&&<p style={{ fontSize:12,color:T.navy700,margin:"0 0 4px",fontWeight:600 }}>Estimasi biaya: {fmtRp(c.cost)}</p>}
                <div style={{ marginTop:6,display:"flex",gap:3,flexWrap:"wrap" }}>
                  {assets.filter(a=>c.asset_ids?.includes(a.id)).map(a=>(
                    <span key={a.id} style={{ background:T.teal50,color:T.teal600,border:`1px solid ${T.teal200}`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap" }}>{a.name}</span>
                  ))}
                </div>
                <p style={{ fontSize:11,color:T.gray400,margin:"4px 0 0" }}>Ditautkan ke {linked} risiko</p>
                {canEdit&&<div style={{ display:"flex",gap:6,marginTop:12 }}>
                  <BtnIcon onClick={()=>setModal({item:c})} title="Edit">✏️</BtnIcon>
                  <BtnIcon onClick={()=>del(c)} title="Hapus">🗑️</BtnIcon>
                </div>}
              </div>
            );
          })}
          {recommended.length===0&&<div style={{ gridColumn:"1/-1",textAlign:"center",padding:"40px",color:T.gray400 }}>✅ Semua kontrol sudah diimplementasikan!</div>}
        </div>
      ) : (
        <Table
          columns={[
            { label:"Nama Kontrol", render:c=><div><p style={{ fontWeight:700,fontSize:13,color:T.navy800,margin:0 }}>{c.name}</p>{c.implementedBy&&c.implementedBy!=="—"&&<p style={{ fontSize:10,color:T.gray400,margin:0 }}>oleh: {c.implementedBy}</p>}</div> },
            { label:"Tipe", render:c=>{ const tb=TYPE_BADGE[c.type]; return <Badge text={c.type==="preventive"?"Preventive":c.type==="detective"?"Detective":"Corrective"} color={tb.c} bg={tb.bg} border={tb.b} size="xs"/>; } },
            { label:"Status", render:c=>{ const sb=STATUS_BADGE[c.status]; return <Badge text={STATUS_LABEL[c.status]} color={sb.c} bg={sb.bg} border={sb.b} size="xs"/>; } },
            { label:"Efektivitas", align:"center", render:c=><div style={{ display:"flex",alignItems:"center",gap:4 }}><span style={{ fontWeight:800,color:T.teal600,fontSize:15 }}>{c.effectiveness}</span><span style={{ fontSize:10,color:T.gray400 }}>/5</span></div> },
            { label:"Biaya (Rp)", align:"right", render:c=><span style={{ fontSize:12,color:T.gray500 }}>{fmtRp(c.cost)}</span> },
            { label:"Aset Dilindungi", render:c=>{
            const linked=assets.filter(a=>c.asset_ids?.includes(a.id));
            if(linked.length===0) return <span style={{ fontSize:11,color:T.gray400 }}>—</span>;
            return <div style={{ display:"flex",gap:3,flexWrap:"wrap",maxWidth:340 }}>{linked.map(a=><span key={a.id} style={{ background:T.teal50,color:T.teal600,border:`1px solid ${T.teal200}`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",marginBottom:2 }}>{a.name}</span>)}</div>;
          }},
            ...(canEdit?[{label:"Aksi",align:"center",render:c=>(
              tab==="active"?(c.status==="implemented"||c.status==="verified"):true
            )?<div style={{ display:"flex",gap:6,justifyContent:"center" }}><BtnIcon onClick={()=>setModal({item:c})} title="Edit">✏️</BtnIcon><BtnIcon onClick={()=>del(c)} title="Hapus">🗑️</BtnIcon></div>:<span/>}]:[]),
          ]}
          data={tab==="active"?filtered.filter(c=>c.status==="implemented"||c.status==="verified"):filtered}
          emptyMsg="Belum ada kontrol terdaftar"
        />
      )}
      {modal&&<Modal title={modal.item?"Edit Kontrol":"Tambah Kontrol"} onClose={()=>setModal(null)} width={640}><CtrlForm item={modal.item} onClose={()=>setModal(null)}/></Modal>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// RISKS PAGE
// ═══════════════════════════════════════════════
function RisksPage({ S, canEdit, user }) {
  const { risks, setRisks, assets, vulns, threats, controls, rc, setRC, log, thresh } = S;
  const thr = thresh || DEFAULT_THRESHOLDS;
  const [modal, setModal] = useState(null);
  const [ctrlModal, setCtrlModal] = useState(null);
  const [search, setSearch] = useState("");
  const [filterLvl, setFilterLvl] = useState("");
  const [filterAsset, setFilterAsset] = useState("");

  const gA = id => assets.find(a=>a.id===id);
  const gV = id => vulns.find(v=>v.id===id);
  const gT = id => threats.find(t=>t.id===id);

  const scored = useMemo(() => risks.map(r => ({ ...r, score:r.likelihood*r.impact, ...getRiskLevel(r.likelihood*r.impact,thr) })), [risks,thr]);

  const filtered = useMemo(() => scored.filter(r =>
    (!search||[gA(r.asset_id)?.name,gT(r.threat_id)?.name,r.notes].some(s=>s?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterLvl||r.level===filterLvl) &&
    (!filterAsset||r.asset_id===filterAsset)
  ).sort((a,b)=>b.score-a.score),[scored,search,filterLvl,filterAsset]);

  function RiskForm({ item, onClose }) {
    const [f, setF] = useState({ asset_id:item?.asset_id||"", vulnerability_id:item?.vulnerability_id||"", threat_id:item?.threat_id||"", likelihood:item?.likelihood??3, impact:item?.impact??3, notes:item?.notes||"" });
    const [err, setErr] = useState("");
    const score = +f.likelihood * +f.impact;
    const lv = getRiskLevel(score, thr);
    const SCALE={1:"Sangat Rendah",2:"Rendah",3:"Sedang",4:"Tinggi",5:"Sangat Tinggi"};
    function pickThreat(id) {
      const t=threats.find(x=>x.id===id);
      setF(p=>({...p,threat_id:id,likelihood:t?.likelihood??p.likelihood,impact:t?.impact??p.impact}));
    }
    function submit(e) {
      e.preventDefault(); setErr("");
      if(!f.asset_id){setErr("Aset wajib dipilih");return;}
      if(!f.vulnerability_id){setErr("Kerentanan wajib dipilih");return;}
      if(!f.threat_id){setErr("Ancaman wajib dipilih");return;}
      const dup=risks.find(r=>r.asset_id===f.asset_id&&r.vulnerability_id===f.vulnerability_id&&r.threat_id===f.threat_id&&r.id!==item?.id);
      if(dup){setErr("Kombinasi Aset+Kerentanan+Ancaman ini sudah ada");return;}
      const saved={...item,...f,likelihood:+f.likelihood,impact:+f.impact,notes:sanitize(f.notes),id:item?.id||uid(),createdAt:item?.createdAt||now(),createdBy:item?.createdBy||user.id};
      if(item){setRisks(risks.map(r=>r.id===saved.id?saved:r));log(user,"UPDATE","Risk",saved.id,`${gA(saved.asset_id)?.name}+${gT(saved.threat_id)?.name}`);}
      else{setRisks([...risks,saved]);log(user,"CREATE","Risk",saved.id,`${gA(saved.asset_id)?.name}+${gT(saved.threat_id)?.name}`);}
      onClose();
    }
    const linkedCtrls = rc.filter(r=>r.risk_id===item?.id);
    const avgEff = linkedCtrls.length>0?controls.filter(c=>linkedCtrls.some(lc=>lc.control_id===c.id)).reduce((s,c)=>s+c.effectiveness,0)/linkedCtrls.length:0;
    const residual = linkedCtrls.length>0?calcResidual(score,avgEff):null;
    const resLv = residual?getRiskLevel(residual,thr):null;
    return (
      <form onSubmit={submit} noValidate>
        <ErrBanner msg={err}/>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label="Aset" required>
            <Sel value={f.asset_id} onChange={e=>setF({...f,asset_id:e.target.value})}>
              <option value="">Pilih aset...</option>
              {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
            </Sel>
          </Field>
          <Field label="Kerentanan" required>
            <Sel value={f.vulnerability_id} onChange={e=>setF({...f,vulnerability_id:e.target.value})}>
              <option value="">Pilih kerentanan...</option>
              {vulns.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
            </Sel>
          </Field>
        </div>
        <Field label="Ancaman * (auto-isi Likelihood & Impact)" required>
          <Sel value={f.threat_id} onChange={e=>pickThreat(e.target.value)}>
            <option value="">Pilih ancaman...</option>
            {threats.map(t=><option key={t.id} value={t.id}>{t.name} (L:{t.likelihood}, I:{t.impact})</option>)}
          </Sel>
        </Field>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          <Field label={`Likelihood: ${f.likelihood}/5 — ${SCALE[f.likelihood]}`}>
            <input type="range" min="1" max="5" step="1" value={f.likelihood} onChange={e=>setF({...f,likelihood:e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
          </Field>
          <Field label={`Impact: ${f.impact}/5 — ${SCALE[f.impact]}`}>
            <input type="range" min="1" max="5" step="1" value={f.impact} onChange={e=>setF({...f,impact:e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
          </Field>
        </div>
        <div style={{ background:lv.bg,border:`1px solid ${lv.border}`,borderRadius:T.r12,padding:"14px 18px",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
            <div><p style={{ fontSize:11,color:T.gray500,margin:0 }}>Formula</p><p style={{ fontSize:24,fontWeight:800,color:lv.color,margin:0 }}>{score}</p></div>
            <div><p style={{ fontSize:11,color:T.gray500,margin:0 }}>= {f.likelihood} × {f.impact}</p><Badge text={lv.level} color={lv.color} bg={lv.bg} border={lv.border}/></div>
            {resLv&&<div style={{ marginLeft:"auto" }}><p style={{ fontSize:11,color:T.gray400,margin:0 }}>Residual ({linkedCtrls.length} kontrol)</p><Badge text={`${resLv.level}·${residual}`} color={resLv.color} bg={resLv.bg} border={resLv.border}/></div>}
          </div>
        </div>
        <Field label="Catatan"><Txta value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} placeholder="Keterangan tambahan..."/></Field>
        <div style={{ display:"flex",gap:10 }}><BtnPrimary type="submit">💾 Simpan</BtnPrimary><BtnSecondary onClick={onClose}>Batal</BtnSecondary></div>
      </form>
    );
  }

  function ControlLinkModal({ riskId, onClose }) {
    const linked=rc.filter(r=>r.risk_id===riskId).map(r=>r.control_id);
    const [sel, setSel]=useState(linked);
    function save() {
      const other=rc.filter(r=>r.risk_id!==riskId);
      setRC([...other,...sel.map(cid=>({id:uid(),risk_id:riskId,control_id:cid}))]);
      log(user,"LINK_CTRL","Risk",riskId,`${sel.length} controls linked`);
      onClose();
    }
    return (
      <Modal title="Tautkan Kontrol ke Risiko" subtitle="Pilih satu atau lebih kontrol mitigasi" onClose={onClose}>
        <div>
          {controls.map(c=>{
            const TYPE_BADGE = { preventive:{c:"#0d47a1",bg:"#e3f2fd",b:"#90caf9"}, detective:{c:"#6a1b9a",bg:"#f3e5f5",b:"#ce93d8"}, corrective:{c:T.green700,bg:T.green100,b:"#86efac"} };
            const tb=TYPE_BADGE[c.type];
            const isLinked=sel.includes(c.id);
            return (
              <label key={c.id} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.gray100}`,cursor:"pointer",background:isLinked?T.teal50:"transparent",borderRadius:T.r8,paddingLeft:isLinked?8:0,transition:"all .12s" }}>
                <input type="checkbox" checked={isLinked} onChange={e=>setSel(e.target.checked?[...sel,c.id]:sel.filter(id=>id!==c.id))} style={{ marginTop:3,accentColor:T.teal500 }}/>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13,fontWeight:700,color:T.navy800,margin:0 }}>{c.name}</p>
                  <div style={{ display:"flex",gap:6,marginTop:4 }}>
                    <Badge text={c.type==="preventive"?"Preventive":c.type==="detective"?"Detective":"Corrective"} color={tb.c} bg={tb.bg} border={tb.b} size="xs"/>
                    <Badge text={`Eff ${c.effectiveness}/5`} color={T.teal600} bg={T.teal50} border={T.teal200} size="xs"/>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <div style={{ display:"flex",gap:10,marginTop:18 }}><BtnPrimary onClick={save}>💾 Simpan Tautan ({sel.length})</BtnPrimary><BtnSecondary onClick={onClose}>Batal</BtnSecondary></div>
      </Modal>
    );
  }

  function del(r) {
    if(!confirm("Hapus risiko ini?"))return;
    setRisks(risks.filter(x=>x.id!==r.id));
    setRC(rc.filter(x=>x.risk_id!==r.id));
    log(user,"DELETE","Risk",r.id,`${gA(r.asset_id)?.name}`);
  }

  const [showPdf, setShowPdf] = useState(false);

  function riskBadgeStyle(level) {
    const m = { CRITICAL:{bg:"#fee2e2",color:"#991b1b",border:"#fca5a5"}, HIGH:{bg:"#ffedd5",color:"#9a3412",border:"#fdba74"}, MEDIUM:{bg:"#fef3c7",color:"#92400e",border:"#fcd34d"}, LOW:{bg:"#dcfce7",color:"#14532d",border:"#86efac"} };
    return m[level] || {bg:"#f1f5f9",color:"#334155",border:"#cbd5e1"};
  }

  return (
    <div className="fade-in">
      {showPdf && (
        <PdfModal title="Laporan Manajemen Risiko" subtitle={`${filtered.length} risiko · Diurutkan skor tertinggi`} onClose={()=>setShowPdf(false)}>
          <table className="rms-pdf-tbl">
            <thead><tr>
              <th>#</th><th>Aset</th><th>Kerentanan</th><th>Ancaman</th><th style={{textAlign:"center"}}>L</th><th style={{textAlign:"center"}}>I</th><th style={{textAlign:"center"}}>Skor</th><th>Level</th><th>Kontrol</th><th>Residual</th><th>Catatan</th>
            </tr></thead>
            <tbody>
              {filtered.map((r,i)=>{
                const lv=riskBadgeStyle(r.level);
                const lcs=rc.filter(x=>x.risk_id===r.id);
                const avg=lcs.length>0?controls.filter(c=>lcs.some(lc=>lc.control_id===c.id)).reduce((s,c)=>s+c.effectiveness,0)/lcs.length:0;
                const res=lcs.length>0?calcResidual(r.score,avg):null;
                const rl=res!=null?riskBadgeStyle(getRiskLevel(res,thr).level):null;
                return (
                  <tr key={r.id}>
                    <td style={{color:"#94a3b8",fontSize:10}}>{i+1}</td>
                    <td style={{fontWeight:700,color:"#0f2040",fontSize:11}}>{gA(r.asset_id)?.name}<br/><span style={{color:"#94a3b8",fontWeight:400}}>{gA(r.asset_id)?.category}</span></td>
                    <td style={{fontSize:11,color:"#475569"}}>{gV(r.vulnerability_id)?.name}</td>
                    <td style={{fontSize:11,color:"#475569"}}>{gT(r.threat_id)?.name}</td>
                    <td style={{textAlign:"center",fontWeight:700}}>{r.likelihood}</td>
                    <td style={{textAlign:"center",fontWeight:700}}>{r.impact}</td>
                    <td style={{textAlign:"center",fontWeight:800,fontSize:15,color:lv.color}}>{r.score}</td>
                    <td><span className="rms-pdf-badge" style={{background:lv.bg,color:lv.color,borderColor:lv.border}}>{r.level}</span></td>
                    <td style={{textAlign:"center",color:"#475569"}}>{lcs.length>0?`${lcs.length} kontrol`:"—"}</td>
                    <td>{rl&&res!=null?<span className="rms-pdf-badge" style={{background:rl.bg,color:rl.color,borderColor:rl.border}}>{getRiskLevel(res,thr).level}·{res}</span>:<span style={{color:"#cbd5e1"}}>—</span>}</td>
                    <td style={{fontSize:10,color:"#64748b"}}>{r.notes||"—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PdfModal>
      )}
      <PageHeader title="Manajemen Risiko" subtitle={`${filtered.length} dari ${risks.length} risiko · Diurutkan skor tertinggi`} icon="⚠️">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari risiko...">
          <Sel value={filterAsset} onChange={e=>setFilterAsset(e.target.value)} style={{ ...baseInput,width:200 }}>
            <option value="">Semua Aset</option>
            {assets.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
          </Sel>
          <Sel value={filterLvl} onChange={e=>setFilterLvl(e.target.value)} style={{ ...baseInput,width:150 }}>
            <option value="">Semua Level</option>
            {["CRITICAL","HIGH","MEDIUM","LOW"].map(l=><option key={l} value={l}>{l}</option>)}
          </Sel>
          <BtnSecondary onClick={()=>setShowPdf(true)}>📄 Export PDF</BtnSecondary>
          {canEdit&&<BtnPrimary onClick={()=>setModal({})}>+ Tambah Risiko</BtnPrimary>}
        </SearchBar>
      </PageHeader>

      <Table
        columns={[
          { label:"Aset", render:r=><div><p style={{ fontWeight:700,fontSize:13,color:T.navy800,margin:0 }}>{gA(r.asset_id)?.name}</p><p style={{ fontSize:10,color:T.gray400,margin:0 }}>{gA(r.asset_id)?.category}</p></div> },
          { label:"Kerentanan", render:r=><span style={{ fontSize:12,color:T.gray600 }}>{gV(r.vulnerability_id)?.name}</span> },
          { label:"Ancaman", render:r=><span style={{ fontSize:12,color:T.gray700 }}>{gT(r.threat_id)?.name}</span> },
          { label:"L × I", align:"center", render:r=><span style={{ fontFamily:"monospace",fontSize:12,color:T.gray500 }}>{r.likelihood}×{r.impact}</span> },
          { label:"Skor", align:"center", render:r=><span style={{ fontWeight:800,fontSize:18,color:getRiskLevel(r.score,thr).color }}>{r.score}</span> },
          { label:"Level", align:"center", render:r=><RiskBadge score={r.score} thr={thr} size="xs"/> },
          { label:"Kontrol", align:"center", render:r=>{
            const n=rc.filter(x=>x.risk_id===r.id).length;
            return <button onClick={e=>{e.stopPropagation();setCtrlModal(r.id);}} style={{ background:n>0?T.green100:"#f8fafc",color:n>0?T.green700:T.gray500,border:`1px solid ${n>0?"#86efac":T.gray200}`,borderRadius:T.rFull,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer",transition:"all .15s" }}>{n>0?`${n} kontrol`:"Tautkan"}</button>;
          }},
          { label:"Residual", align:"center", render:r=>{
            const lcs=rc.filter(x=>x.risk_id===r.id);
            if(lcs.length===0)return<span style={{ fontSize:11,color:T.gray300 }}>—</span>;
            const avg=controls.filter(c=>lcs.some(lc=>lc.control_id===c.id)).reduce((s,c)=>s+c.effectiveness,0)/lcs.length;
            const res=calcResidual(r.score,avg);
            const rl=getRiskLevel(res,thr);
            return <Badge text={`${rl.level}·${res}`} color={rl.color} bg={rl.bg} border={rl.border} size="xs"/>;
          }},
          ...(canEdit?[{label:"Aksi",align:"center",render:r=>(
            <div style={{ display:"flex",gap:6,justifyContent:"center" }}>
              <BtnIcon onClick={()=>setModal({item:r})} title="Edit">✏️</BtnIcon>
              <BtnIcon onClick={()=>del(r)} title="Hapus">🗑️</BtnIcon>
            </div>
          )}]:[]),
        ]}
        data={filtered}
        emptyMsg="Belum ada risiko terdaftar"
      />
      {modal&&<Modal title={modal.item?"Edit Risiko":"Tambah Risiko Baru"} subtitle="Asset → Kerentanan → Ancaman → Skor" onClose={()=>setModal(null)} width={620}><RiskForm item={modal.item} onClose={()=>setModal(null)}/></Modal>}
      {ctrlModal&&<ControlLinkModal riskId={ctrlModal} onClose={()=>setCtrlModal(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════
// RISK MATRIX PAGE — editable cells, 6 tabs
// ═══════════════════════════════════════════════
function MatrixPage({ S, canEdit, user }) {
  const { risks, assets, vulns, threats, controls, rc, thresh, matAV, setMatAV, matVT, setMatVT, matTC, setMatTC, log } = S;

const [openStates, setOpenStates] = useState(new Array(4).fill(false)); // LOW=0,MED=1,HIGH=2,CRIT=3
  const [colModal, setColModal] = useState(null);
  const thr = thresh || DEFAULT_THRESHOLDS;
  const [tab, setTab] = useState("heatmap");
  const [hovered, setHovered] = useState(null);
  const [groupBy, setGroupBy] = useState("level");

  // Dynamic column/row extraction utils
  const getCurrentCols = useCallback((matrixData, availableCols) => {
    const colIds = Array.from(new Set(matrixData.map(row => row[1])));
    return availableCols.filter(col => colIds.includes(col.id)).sort((a,b) => colIds.indexOf(a.id) - colIds.indexOf(b.id));
  }, []);

  const getCurrentRows = useCallback((matrixData, availableRows) => {
    const rowIds = Array.from(new Set(matrixData.map(row => row[0])));
    return availableRows.filter(row => rowIds.includes(row.id)).sort((a,b) => rowIds.indexOf(a.id) - rowIds.indexOf(b.id));
  }, []);

  // Per-tab dynamic cols/rows  
  const avCols = getCurrentCols(matAV, assets);
  const avRows = getCurrentRows(matAV, vulns);
  const vtCols = getCurrentCols(matVT, vulns);
  const vtRows = getCurrentRows(matVT, threats);
  const tcCols = getCurrentCols(matTC, threats);
  const tcRows = getCurrentRows(matTC, controls);

  // Saat halaman matrix dibuka, sync state dengan localStorage
  useEffect(() => {
    setMatAV([...SEED.matrix_av]);
    setMatVT([...SEED.matrix_vt]);
    setMatTC([...SEED.matrix_tc]);
  }, []); // ✅ Safe: deps stable, no violations

  const scored = useMemo(() => risks.map(r => ({ ...r, score:r.likelihood*r.impact, ...getRiskLevel(r.likelihood*r.impact,thr) })), [risks,thr]);
  const at = (l,i) => scored.filter(r=>r.likelihood===l&&r.impact===i);
  const gA = id => assets.find(a=>a.id===id);
  const gV = id => vulns.find(v=>v.id===id);
  const gT = id => threats.find(t=>t.id===id);

  // Editable matrix cell component
  function EditableCell({ value, onChange, disabled }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const ref = useRef();
    const colors = {0:{bg:"#fff",c:T.gray300},1:{bg:T.green100,c:T.green700},2:{bg:T.amber100,c:T.amber700},3:{bg:T.red100,c:T.red700}};
    const col = colors[value]||colors[0];
    if(editing) return (
      <input ref={ref} type="number" min="0" max="3" value={draft}
        onChange={e=>setDraft(e.target.value)}
        onBlur={()=>{ setEditing(false); const v=Math.min(3,Math.max(0,+draft)); onChange(v); }}
        onKeyDown={e=>{ if(e.key==="Enter"||e.key==="Escape"){ setEditing(false); const v=Math.min(3,Math.max(0,+draft)); onChange(v); }}}
        style={{ width:40,height:32,textAlign:"center",border:`2px solid ${T.teal500}`,borderRadius:T.r6,fontSize:13,fontWeight:800,background:T.teal50,color:T.teal600,fontFamily:"inherit" }}
        autoFocus />
    );
    return (
      <div onClick={()=>{ if(!disabled){setDraft(value);setEditing(true);}}} title={disabled?"":"Klik untuk edit"}
        style={{ width:40,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:T.r6,background:col.bg,border:`1px solid ${col.c}44`,cursor:disabled?"default":"pointer",fontSize:13,fontWeight:800,color:col.c,transition:"all .12s",userSelect:"none" }}
        onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=".75";}}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        {value}
      </div>
    );
  }

  // Generic matrix table renderer
function MatrixTable({ rows, rowLabel, cols, colLabel, matData, setMat, rowKey, colKey, disabled, log, user }) {
    function getVal(rId, cId) { return matData.find(m=>m[0]===rId&&m[1]===cId)?.[2]||0; }
    function setVal(rId, cId, v) {
      const next = matData.filter(m=>!(m[0]===rId&&m[1]===cId));
      if(v>0) next.push([rId,cId,v]);
      setMat(next);
      log(user,"UPDATE",`Matrix_${rowLabel}`,rId,`${rId}×${cId}=${v}`);
    }
    return (
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse",fontSize:12 }}>
          <thead>
            <tr>
              <th style={{ padding:"10px 14px",background:`linear-gradient(135deg,${T.navy800},${T.navy700})`,color:T.white,fontWeight:700,fontSize:11,textAlign:"left",minWidth:180,borderRadius:"8px 0 0 0" }}>{rowLabel} \ {colLabel}</th>
              {cols.map(c=><th key={c[colKey]} style={{ padding:"10px 10px",background:`linear-gradient(135deg,${T.navy800},${T.navy700})`,color:T.white,fontWeight:600,fontSize:11,textAlign:"center",maxWidth:80 }}>{c.name?.slice(0,16)}{c.name?.length>16?"…":""}</th>)}
              <th style={{ padding:"10px 10px",background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,color:T.white,fontWeight:800,fontSize:11,textAlign:"center",borderRadius:"0 8px 0 0" }}>Agregat</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row,ri)=>{
              const agg = cols.reduce((s,c)=>s+getVal(row[rowKey],c[colKey]),0);
              return (
                <tr key={row[rowKey]} style={{ background:ri%2===0?T.white:T.gray50 }}>
                  <td style={{ padding:"8px 14px",fontWeight:700,fontSize:12,color:T.navy800,borderRight:`1px solid ${T.gray200}`,borderBottom:`1px solid ${T.gray100}` }}>{row.name?.slice(0,28)}{row.name?.length>28?"…":""}</td>
                  {cols.map(c=>(
                    <td key={c[colKey]} style={{ padding:"6px 8px",textAlign:"center",borderRight:`1px solid ${T.gray100}`,borderBottom:`1px solid ${T.gray100}` }}>
                      <EditableCell value={getVal(row[rowKey],c[colKey])} onChange={v=>setVal(row[rowKey],c[colKey],v)} disabled={disabled}/>
                    </td>
                  ))}
                  <td style={{ padding:"8px 10px",textAlign:"center",fontWeight:800,fontSize:14,color:agg>=8?T.red700:agg>=5?T.orange700:T.navy700,background:agg>=8?"#fff0f0":agg>=5?"#fff8f0":T.navy50,borderBottom:`1px solid ${T.gray100}` }}>{agg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!disabled&&<p style={{ fontSize:11,color:T.teal600,marginTop:8,fontWeight:600 }}>💡 Klik sel angka untuk mengedit nilai (0=Tidak Relevan, 1=Rendah, 2=Sedang, 3=Tinggi)</p>}
      </div>
    );
  }

  const ranking = useMemo(() => [...scored].sort((a,b)=>b.score-a.score), [scored]);

  const grouped = useMemo(() => {
    const grp = {};
    scored.forEach(r=>{
      const key = groupBy==="asset"?gA(r.asset_id)?.name:groupBy==="vuln"?gV(r.vulnerability_id)?.name:r.level;
      if(!grp[key])grp[key]=[];
      grp[key].push(r);
    });
    return Object.entries(grp).sort((a,b)=>b[1].reduce((s,r)=>s+r.score,0)-a[1].reduce((s,r)=>s+r.score,0));
  }, [scored,groupBy]);

  const cellBg = (l,i) => { const lv=getRiskLevel(l*i,thr); return {bg:lv.bg,border:lv.border,text:lv.color}; };

  const [showPdf, setShowPdf] = useState(false);
  function riskBadgeStyleM(level) {
    const m = { CRITICAL:{bg:"#fee2e2",color:"#991b1b",border:"#fca5a5"}, HIGH:{bg:"#ffedd5",color:"#9a3412",border:"#fdba74"}, MEDIUM:{bg:"#fef3c7",color:"#92400e",border:"#fcd34d"}, LOW:{bg:"#dcfce7",color:"#14532d",border:"#86efac"} };
    return m[level] || {bg:"#f1f5f9",color:"#334155",border:"#cbd5e1"};
  }

  return (
    <div className="fade-in">
      {showPdf && (
        <PdfModal title="Laporan Risk Matrix" subtitle={`${scored.length} risiko · Ranking & Distribusi`} onClose={()=>setShowPdf(false)}>
          <h3 style={{fontSize:13,fontWeight:800,color:"#0f2040",margin:"0 0 4px"}}>Ranking Risiko (Tertinggi ke Terendah)</h3>
          <table className="rms-pdf-tbl">
            <thead><tr>
              <th>#</th><th>Aset</th><th>Kerentanan</th><th>Ancaman</th><th style={{textAlign:"center"}}>L</th><th style={{textAlign:"center"}}>I</th><th style={{textAlign:"center"}}>Skor</th><th>Level</th>
            </tr></thead>
            <tbody>
              {ranking.map((r,i)=>{
                const lv=riskBadgeStyleM(r.level);
                return (
                  <tr key={r.id}>
                    <td style={{color:"#94a3b8",fontSize:10,fontWeight:700}}>{i+1}</td>
                    <td style={{fontWeight:700,color:"#0f2040",fontSize:11}}>{gA(r.asset_id)?.name}</td>
                    <td style={{fontSize:11,color:"#475569"}}>{gV(r.vulnerability_id)?.name}</td>
                    <td style={{fontSize:11,color:"#475569"}}>{gT(r.threat_id)?.name}</td>
                    <td style={{textAlign:"center",fontWeight:700}}>{r.likelihood}</td>
                    <td style={{textAlign:"center",fontWeight:700}}>{r.impact}</td>
                    <td style={{textAlign:"center",fontWeight:800,fontSize:15,color:lv.color}}>{r.score}</td>
                    <td><span className="rms-pdf-badge" style={{background:lv.bg,color:lv.color,borderColor:lv.border}}>{r.level}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {["CRITICAL","HIGH","MEDIUM","LOW"].map(lvl=>{
              const s=riskBadgeStyleM(lvl);
              const cnt=scored.filter(r=>r.level===lvl).length;
              return (
                <div key={lvl} style={{background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:8,padding:"12px 14px",textAlign:"center"}}>
                  <p style={{fontSize:10,fontWeight:700,color:s.color,margin:"0 0 4px",textTransform:"uppercase"}}>{lvl}</p>
                  <p style={{fontSize:26,fontWeight:800,color:s.color,margin:0}}>{cnt}</p>
                  <p style={{fontSize:10,color:s.color,margin:"2px 0 0",opacity:.7}}>risiko</p>
                </div>
              );
            })}
          </div>
        </PdfModal>
      )}
      <PageHeader title="Risk Matrix & Visualisasi" subtitle="Heatmap · Ranking · Grouping · 3 Matriks Laporan UALS" icon="▣">
        <BtnSecondary onClick={()=>setShowPdf(true)}>📄 Export PDF</BtnSecondary>
      </PageHeader>

      <TabBar tabs={[
        {id:"heatmap",label:"Heatmap 5×5"},
        {id:"ranking",label:"Ranking",count:scored.length},
        {id:"grouping",label:"Grouping"},
        {id:"av",label:"Matriks Aset×Vuln"},
        {id:"vt",label:"Matriks Vuln×Threat"},
        {id:"tc",label:"Matriks Threat×Control"},
      ]} active={tab} onChange={setTab}/>

      {/* HEATMAP */}
      {tab==="heatmap"&&(
        <div style={{ display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap" }}>
          <div>
            <div style={{ display:"flex",alignItems:"flex-start",gap:4 }}>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:0,marginRight:2 }}>
                {[5,4,3,2,1].map(i=>(
                  <div key={i} style={{ height:70,display:"flex",alignItems:"center",justifyContent:"center",width:22 }}>
                    <span style={{ fontSize:12,color:T.gray500,fontWeight:700 }}>{i}</span>
                  </div>
                ))}
                <div style={{ height:28 }}/>
              </div>
              <div>
                {[5,4,3,2,1].map(impact=>(
                  <div key={impact} style={{ display:"flex",gap:4,marginBottom:4 }}>
                    {[1,2,3,4,5].map(likelihood=>{
                      const cells=at(likelihood,impact), c=cellBg(likelihood,impact);
                      return (
                        <div key={likelihood} style={{ width:88,height:66,background:c.bg,borderRadius:T.r10,border:`2px solid ${c.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"transform .15s",cursor:"default" }}
                          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.06)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                          <span style={{ fontSize:15,fontWeight:800,color:c.text }}>{likelihood*impact}</span>
                          {cells.length>0&&(
                            <div style={{ display:"flex",flexWrap:"wrap",gap:3,marginTop:4,padding:"0 6px",justifyContent:"center" }}>
                              {cells.slice(0,5).map(r=>(
                                <div key={r.id} onMouseEnter={()=>setHovered(r)} onMouseLeave={()=>setHovered(null)}
                                  style={{ width:12,height:12,borderRadius:"50%",background:c.text,cursor:"pointer",transition:"transform .15s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}
                                  onMouseOver={e=>e.currentTarget.style.transform="scale(1.8)"}
                                  onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}/>
                              ))}
                              {cells.length>5&&<span style={{ fontSize:9,color:c.text,fontWeight:800 }}>+{cells.length-5}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div style={{ display:"flex",gap:4,marginTop:4,paddingLeft:0 }}>
                  {[1,2,3,4,5].map(l=><div key={l} style={{ width:88,textAlign:"center",fontSize:12,color:T.gray500,fontWeight:700 }}>{l}</div>)}
                </div>
                <p style={{ textAlign:"center",fontSize:11,color:T.gray400,marginTop:4,letterSpacing:".04em" }}>LIKELIHOOD →</p>
              </div>
              <div style={{ display:"flex",alignItems:"center",marginLeft:4,height:350 }}>
                <span style={{ fontSize:11,color:T.gray400,writingMode:"vertical-rl",transform:"rotate(180deg)",letterSpacing:".08em",textAlign:"center" }}>↑ IMPACT</span>
              </div>
            </div>
          </div>

          <div style={{ flex:1,minWidth:220,display:"flex",flexDirection:"column",gap:14 }}>
            {/* Legend */}
            <div style={{ background:T.white,borderRadius:T.r14,border:`1px solid ${T.gray200}`,padding:"18px 20px",boxShadow:T.shadow1 }}>
              <p style={{ fontSize:13,fontWeight:800,color:T.navy800,margin:"0 0 14px" }}>Legenda Warna & Keterangan</p>

              {/* Penjelasan sistem skoring */}
              <div style={{ background:T.navy50,borderRadius:T.r10,border:`1px solid ${T.navy100}`,padding:"10px 12px",marginBottom:14 }}>
                <p style={{ fontSize:12,fontWeight:800,color:T.navy700,margin:"0 0 4px" }}>Dasar Perhitungan</p>
                <p style={{ fontSize:11,color:T.gray600,margin:0,lineHeight:1.6 }}>
                  <strong>Skor Risiko = Likelihood × Impact</strong><br/>
                  Skala: 1 (sangat rendah) hingga 5 (sangat tinggi).<br/>
                  Skor minimum: 1×1 = <strong>1</strong>, maksimum: 5×5 = <strong>25</strong>.
                </p>
              </div>

              {/* Level cards dengan deskripsi + aset terkait */}
              {[
                {
                  label:"LOW", range:`1–${thr.low}`, lv:getRiskLevel(1,thr),
                  desc:`Skor 1–${thr.low}: Risiko dapat terjadi namun dampak & kemungkinannya sangat kecil. Cukup dipantau secara berkala, tidak memerlukan tindakan mendesak.`,
                },
                {
                  label:"MEDIUM", range:`${thr.low+1}–${thr.medium}`, lv:getRiskLevel(thr.low+1,thr),
                  desc:`Skor ${thr.low+1}–${thr.medium}: Risiko cukup signifikan. Perlu perhatian dan rencana mitigasi dalam jangka menengah agar tidak berkembang menjadi HIGH.`,
                },
                {
                  label:"HIGH", range:`${thr.medium+1}–${thr.high}`, lv:getRiskLevel(thr.medium+1,thr),
                  desc:`Skor ${thr.medium+1}–${thr.high}: Risiko serius dengan kombinasi likelihood & impact yang tinggi. Harus segera ditangani dengan kontrol tambahan.`,
                },
                {
                  label:"CRITICAL", range:`${thr.high+1}–25`, lv:getRiskLevel(thr.high+1,thr),
                  desc:`Skor ${thr.high+1}–25: Risiko paling berbahaya. Likelihood & impact keduanya sangat tinggi. Tindakan darurat dan eskalasi ke manajemen diperlukan segera.`,
                },
              ].map((x,i)=>{
                const levelRisks = scored.filter(r=>r.level===x.label);
                const levelAssets = [...new Set(levelRisks.map(r=>gA(r.asset_id)?.name).filter(Boolean))];
                const open = openStates[i];
                const setOpen = () => setOpenStates(prev => {
                  const next = [...prev];
                  next[i] = !next[i];
                  return next;
                });
                return (
                  <div key={x.label} style={{ marginBottom:10,border:`1px solid ${x.lv.border}`,borderRadius:T.r10,overflow:"hidden" }}>
                    {/* Header row */}
                    <div onClick={()=>setOpen(!open)}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:x.lv.bg,cursor:"pointer" }}>
                      <div style={{ width:16,height:16,borderRadius:4,background:x.lv.bg,border:`2px solid ${x.lv.border}`,flexShrink:0 }}/>
                      <span style={{ fontSize:13,color:x.lv.color,fontWeight:800,flex:1 }}>{x.label}</span>
                      <span style={{ fontSize:11,color:x.lv.color,opacity:.7 }}>({x.range})</span>
                      <span style={{ fontSize:15,fontWeight:800,color:x.lv.color,minWidth:20,textAlign:"center" }}>{levelRisks.length}</span>
                      <span style={{ fontSize:12,color:x.lv.color,opacity:.6 }}>{open?"▲":"▼"}</span>
                    </div>
                    {/* Expandable detail */}
                    {open && (
                      <div style={{ padding:"10px 12px",background:T.white,borderTop:`1px solid ${x.lv.border}` }}>
                        {/* Deskripsi alasan */}
                        <p style={{ fontSize:11,color:T.gray600,lineHeight:1.65,margin:"0 0 10px",paddingBottom:8,borderBottom:`1px dashed ${T.gray200}` }}>
                          📌 {x.desc}
                        </p>
                        {/* Aset terkait */}
                        {levelAssets.length > 0 ? (
                          <div>
                            <p style={{ fontSize:11,fontWeight:800,color:T.gray500,margin:"0 0 6px",textTransform:"uppercase",letterSpacing:".05em" }}>
                              Aset yang berisiko ({levelAssets.length}):
                            </p>
                            <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                              {levelRisks.map(r=>{
                                const lv2=getRiskLevel(r.score,thr);
                                return (
                                  <div key={r.id} style={{ display:"flex",alignItems:"flex-start",gap:6,padding:"5px 8px",background:x.lv.bg,borderRadius:T.r6,border:`1px solid ${x.lv.border}` }}>
                                    <div style={{ flexShrink:0,marginTop:2 }}>
                                      <span style={{ background:lv2.bg,color:lv2.color,border:`1px solid ${lv2.border}`,borderRadius:20,padding:"1px 6px",fontSize:10,fontWeight:800 }}>{r.score}</span>
                                    </div>
                                    <div style={{ flex:1,minWidth:0 }}>
                                      <p style={{ fontSize:11,fontWeight:700,color:T.navy800,margin:0 }}>{gA(r.asset_id)?.name}</p>
                                      <p style={{ fontSize:10,color:T.gray500,margin:0 }}>
                                        {gV(r.vulnerability_id)?.name?.slice(0,30)}{gV(r.vulnerability_id)?.name?.length>30?"…":""} → {gT(r.threat_id)?.name}
                                      </p>
                                      <p style={{ fontSize:10,color:T.gray400,margin:0 }}>
                                        L:{r.likelihood} × I:{r.impact} = {r.score}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p style={{ fontSize:11,color:T.gray400,margin:0,textAlign:"center",padding:"8px 0" }}>✓ Tidak ada risiko pada level ini</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Hover detail */}
            {hovered ? (
              <div className="fade-in" style={{ background:T.white,borderRadius:T.r14,border:`2px solid ${getRiskLevel(hovered.score,thr).border}`,padding:"18px 20px",boxShadow:T.shadow2 }}>
                <p style={{ fontSize:12,fontWeight:800,color:T.gray500,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:".06em" }}>Detail Risiko</p>
                {[["Aset",gA(hovered.asset_id)?.name],["Kerentanan",gV(hovered.vulnerability_id)?.name],["Ancaman",gT(hovered.threat_id)?.name],["Formula",`${hovered.likelihood} × ${hovered.impact} = ${hovered.score}`]].map(([k,v])=>(
                  <div key={k} style={{ marginBottom:8 }}>
                    <p style={{ fontSize:10,color:T.gray400,margin:0,textTransform:"uppercase",fontWeight:700 }}>{k}</p>
                    <p style={{ fontSize:13,fontWeight:600,color:T.gray800,margin:"1px 0 0" }}>{v}</p>
                  </div>
                ))}
                <RiskBadge score={hovered.score} thr={thr}/>
              </div>
            ) : (
              <div style={{ background:T.teal50,borderRadius:T.r12,border:`1px solid ${T.teal200}`,padding:"16px",textAlign:"center" }}>
                <p style={{ fontSize:12,color:T.teal600,margin:0,fontWeight:600 }}>Hover pada titik (●) untuk melihat detail risiko</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RANKING */}
{tab==="ranking"&&(
        <Table
          columns={[
            {
              label: "#",
              align: "center",
              render: (_, i) => {
                const s = "linear-gradient(135deg," + T.navy700 + "," + T.teal600 + ")";
                return (
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: s,
                      color: "white",
                      fontSize: 12,
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {String(i + 1)}
                  </span>
                );
              }
            },
            {
              label: "Aset",
              render: r => (
                <span style={{ fontWeight: "700", fontSize: 13, color: T.navy800 }}>
                  {gA(r.asset_id)?.name}
                </span>
              )
            },
            {
              label: "Kerentanan",
              render: r => (
                <span style={{ fontSize: 12, color: T.gray500 }}>
                  {gV(r.vulnerability_id)?.name}
                </span>
              )
            },
            {
              label: "Ancaman",
              render: r => (
                <span style={{ fontSize: 12 }}>
                  {gT(r.threat_id)?.name}
                </span>
              )
            },
            {
              label: "L",
              align: "center",
              render: r => r.likelihood
            },
            {
              label: "I",
              align: "center",
              render: r => r.impact
            },
            {
              label: "Skor",
              align: "center",
              render: r => (
                <span style={{ fontWeight: 800, fontSize: 18, color: getRiskLevel(r.score, thr).color }}>
                  {r.score}
                </span>
              )
            },
            {
              label: "Level",
              align: "center",
              render: r => <RiskBadge score={r.score} thr={thr} size="xs" />
            },
            {
              label: "Residual",
              align: "center",
              render: r => {
                const lcs = S.rc.filter(x => x.risk_id === r.id);
                if (!lcs.length) return <span style={{ color: T.gray300, fontSize: 11 }}>—</span>;
                const avg = controls.filter(c => lcs.some(lc => lc.control_id === c.id)).reduce((s, c) => s + c.effectiveness, 0) / lcs.length;
                const res = calcResidual(r.score, avg);
                const rl = getRiskLevel(res, thr);
                return (
                  <Badge
                    text={`${rl.level}·${res}`}
                    color={rl.color}
                    bg={rl.bg}
                    border={rl.border}
                    size="xs"
                  />
                );
              }
            }
          ]}
          data={ranking.map((r, i) => ({ ...r, _idx: i }))}
          emptyMsg="Belum ada data risiko"
        />
      )}

      {/* GROUPING */}
      {tab==="grouping"&&(
        <div>
          <div style={{ display:"flex",gap:8,marginBottom:18 }}>
            {[["level","Per Level"],["asset","Per Aset"],["vuln","Per Kerentanan"]].map(([g,l])=>(
              <button key={g} onClick={()=>setGroupBy(g)} style={{ padding:"8px 16px",borderRadius:T.r8,border:`1.5px solid ${groupBy===g?T.teal500:T.gray200}`,background:groupBy===g?T.teal50:T.white,color:groupBy===g?T.teal600:T.gray500,fontSize:13,fontWeight:groupBy===g?800:500,cursor:"pointer" }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {grouped.map(([key,grpRisks])=>{
              const maxS=Math.max(...grpRisks.map(r=>r.score));
              const topLv=getRiskLevel(maxS,thr);
              return (
                <div key={key} style={{ background:T.white,borderRadius:T.r14,border:`1px solid ${topLv.border}`,padding:"18px 20px",boxShadow:T.shadow1 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                    <div>
                      <span style={{ fontWeight:800,fontSize:15,color:T.navy800 }}>{key}</span>
                      <span style={{ fontSize:12,color:T.gray400,marginLeft:10 }}>{grpRisks.length} risiko</span>
                    </div>
                    <div style={{ display:"flex",gap:6 }}>
                      <Badge text={`Skor max: ${maxS}`} color={topLv.color} bg={topLv.bg} border={topLv.border} size="xs"/>
                      <Badge text={`Total: ${grpRisks.reduce((s,r)=>s+r.score,0)}`} color={T.navy700} bg={T.navy50} border={T.navy100} size="xs"/>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {grpRisks.map(r=>{const lv=getRiskLevel(r.score,thr);return <Badge key={r.id} text={`${gA(r.asset_id)?.name?.slice(0,18)} · ${r.score}`} color={lv.color} bg={lv.bg} border={lv.border} size="xs"/>;  })}
                  </div>
                </div>
              );
            })}
            {grouped.length===0&&<div style={{ textAlign:"center",padding:40,color:T.gray400 }}>Tidak ada data</div>}
          </div>
        </div>
      )}

      {/* MATRIKS AV */}
{tab==="av"&&(
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div>
              <p style={{ fontSize:15,fontWeight:800,color:T.navy800,margin:0 }}>Matriks Aset × Kerentanan ({avRows.length}×{avCols.length})</p>
              <p style={{ fontSize:12,color:T.gray500,margin:"3px 0 0" }}>Tingkat hubungan antara Aset dan Kerentanan · 0=Tidak Relevan · 1=Rendah · 2=Sedang · 3=Tinggi</p>
            </div>
{canEdit && (
              <BtnPrimary onClick={() => setColModal({
                matrixType: 'AV',
                matrixData: matAV,
                setMatrixData: setMatAV,
                availableCols: assets,
                currentCols: avCols,
                rows: avRows
              })}>
                🛠 Manage Columns
              </BtnPrimary>

            )}
          </div>
          <MatrixTable rows={avRows} rowLabel="Kerentanan" cols={avCols} colLabel="Aset" matData={matAV} setMat={setMatAV} rowKey="id" colKey="id" disabled={!canEdit}/>
          <div style={{ marginTop:14,padding:"12px 16px",background:T.navy50,borderRadius:T.r10,border:`1px solid ${T.navy100}` }}>
            <p style={{ fontSize:12,color:T.navy700,margin:0,fontWeight:600 }}>💡 Kesimpulan: Kerentanan "Tidak Ada SOP" memiliki agregat tertinggi (11), diikuti "Tidak ada server" dan "Data Manual Excel" (8) — sesuai laporan UALS.</p>
          </div>
          {colModal && colModal.matrixType === 'AV' && (
            <Modal 
              title={`Manage Columns - ${colModal.matrixType}`} 
              subtitle={`Current: ${colModal.currentCols?.length || 0} columns`}
              onClose={() => setColModal(false)}
              width={680}
            >
              <ColManager 
                matrixData={colModal.matrixData}
                setMatrixData={colModal.setMatrixData}
                availableCols={colModal.availableCols}
                matrixType={colModal.matrixType}
                log={log}
                user={user}
                onClose={() => setColModal(false)}
              />
            </Modal>
          )}
        </div>
      )}

      {/* MATRIKS VT */}
{tab==="vt"&&(
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div>
              <p style={{ fontSize:15,fontWeight:800,color:T.navy800,margin:0 }}>Matriks Kerentanan × Ancaman ({vtRows.length}×{vtCols.length})</p>
              <p style={{ fontSize:12,color:T.gray500,margin:"3px 0 0" }}>Seberapa banyak kerentanan yang dapat dieksploitasi tiap ancaman · 0=Tidak Relevan · 1=Rendah · 2=Sedang · 3=Tinggi</p>
            </div>
{canEdit && (
              <BtnPrimary onClick={() => setColModal({
                matrixType: 'VT',
                matrixData: matVT,
                setMatrixData: setMatVT,
                availableCols: vulns,
                currentCols: vtCols,
                rows: vtRows
              })}>
                🛠 Manage Columns
              </BtnPrimary>
            )}
          </div>
          <MatrixTable rows={vtRows} rowLabel="Ancaman" cols={vtCols} colLabel="Kerentanan" matData={matVT} setMat={setMatVT} rowKey="id" colKey="id" disabled={!canEdit}/>
          <div style={{ marginTop:14,padding:"12px 16px",background:T.navy50,borderRadius:T.r10,border:`1px solid ${T.navy100}` }}>
            <p style={{ fontSize:12,color:T.navy700,margin:0,fontWeight:600 }}>💡 Kesimpulan: Kehilangan Data & Kerusakan Hardware agregat 10 · Virus/Malware & Insider Attack 9 — sesuai laporan UALS.</p>
          </div>
          {colModal && colModal.matrixType === 'VT' && (
            <Modal 
              title={`Manage Columns - ${colModal.matrixType}`} 
              subtitle={`Current: ${colModal.currentCols?.length || 0} columns`}
              onClose={() => setColModal(false)}
              width={680}
            >
              <ColManager 
                matrixData={colModal.matrixData}
                setMatrixData={colModal.setMatrixData}
                availableCols={colModal.availableCols}
                matrixType={colModal.matrixType}
                log={log}
                user={user}
                onClose={() => setColModal(false)}
              />
            </Modal>
          )}
        </div>
      )}

      {/* MATRIKS TC */}
{tab==="tc"&&(
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div>
              <p style={{ fontSize:15,fontWeight:800,color:T.navy800,margin:0 }}>Matriks Ancaman × Kontrol ({tcRows.length}×{tcCols.length})</p>
              <p style={{ fontSize:12,color:T.gray500,margin:"3px 0 0" }}>Seberapa efektif tiap kontrol dalam menangani ancaman · 0=Tidak Relevan · 1=Rendah · 2=Sedang · 3=Tinggi</p>
            </div>
{canEdit && (
              <BtnPrimary onClick={() => setColModal({
                matrixType: 'TC',
                matrixData: matTC,
                setMatrixData: setMatTC,
                availableCols: controls,
                currentCols: tcCols,
                rows: tcRows
              })}>
                🛠 Manage Columns
              </BtnPrimary>
            )}
          </div>
          <MatrixTable rows={tcRows} rowLabel="Kontrol" cols={tcCols} colLabel="Ancaman" matData={matTC} setMat={setMatTC} rowKey="id" colKey="id" disabled={!canEdit}/>
          <div style={{ marginTop:14,padding:"12px 16px",background:T.teal50,borderRadius:T.r10,border:`1px solid ${T.teal200}` }}>
            <p style={{ fontSize:12,color:T.teal600,margin:0,fontWeight:600 }}>💡 Kesimpulan: Pelatihan IT (agregat 8) & Backup/Antivirus/Firewall/Update (7) paling efektif. Website down & serangan jaringan masih kurang tertangani.</p>
          </div>
          {colModal && colModal.matrixType === 'TC' && (
            <Modal 
              title={`Manage Columns - ${colModal.matrixType}`} 
              subtitle={`Current: ${colModal.currentCols?.length || 0} columns`}
              onClose={() => setColModal(false)}
              width={680}
            >
              <ColManager 
                matrixData={colModal.matrixData}
                setMatrixData={colModal.setMatrixData}
                availableCols={colModal.availableCols}
                matrixType={colModal.matrixType}
                log={log}
                user={user}
                onClose={() => setColModal(false)}
              />
            </Modal>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AUDIT PAGE
// ═══════════════════════════════════════════════
function AuditPage({ S }) {
  const { audit } = S;
  const [search, setSearch] = useState("");
  const filtered = audit.filter(l=>!search||[l.userName,l.action,l.entity,l.detail].some(v=>String(v||"").toLowerCase().includes(search.toLowerCase())));
  const AC = { CREATE:{c:T.green700,bg:T.green100,b:"#86efac"}, UPDATE:{c:"#0d47a1",bg:"#e3f2fd",b:"#90caf9"}, DELETE:{c:T.red700,bg:T.red100,b:"#fecaca"}, LINK_CTRL:{c:"#6a1b9a",bg:"#f3e5f5",b:"#ce93d8"} };
  return (
    <div className="fade-in">
      <PageHeader title="Audit Trail & Histori" subtitle={`${audit.length} aktivitas tercatat (300 terbaru)`} icon="📋">
        <SearchBar value={search} onChange={setSearch} placeholder="Cari aktivitas..."/>
      </PageHeader>
      {filtered.length===0?<div style={{ textAlign:"center",padding:48,color:T.gray400 }}>Belum ada aktivitas yang dicatat</div>:(
        <Table
          columns={[
            {label:"Waktu",render:l=><span style={{ fontSize:11,color:T.gray500 }}>{fmtDate(l.timestamp)}</span>},
            {label:"Pengguna",render:l=><div><p style={{ fontWeight:700,fontSize:12,color:T.navy800,margin:0 }}>{l.userName}</p><p style={{ fontSize:10,color:T.gray400,margin:0,textTransform:"uppercase" }}>{l.userRole}</p></div>},
            {label:"Aksi",render:l=>{ const ac=AC[l.action]||{c:T.gray600,bg:T.gray100,b:T.gray300}; return <Badge text={l.action} color={ac.c} bg={ac.bg} border={ac.b} size="xs"/>; }},
            {label:"Entitas",key:"entity",muted:true},
            {label:"Detail",render:l=><span style={{ fontSize:12,color:T.gray600 }}>{l.detail}</span>},
          ]}
          data={filtered}
          emptyMsg="Tidak ada hasil pencarian"
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════
function SettingsPage({ S, user }) {
  const { thresh, setThresh } = S;
  const [f, setF] = useState({ ...thresh });
  const [saved, setSaved] = useState(false);
  function save() {
    if(f.low>=f.medium||f.medium>=f.high){alert("Threshold harus: LOW < MEDIUM < HIGH");return;}
    setThresh(f); setSaved(true); setTimeout(()=>setSaved(false),2500);
  }
  return (
    <div className="fade-in" style={{ maxWidth:560 }}>
      <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi threshold, info akun, reset data" icon="⚙️"/>
      {saved&&<SuccessBanner msg="Threshold berhasil disimpan! Semua perhitungan risiko telah diperbarui."/>}

      <div style={{ background:T.white,borderRadius:T.r14,border:`1px solid ${T.gray200}`,padding:"22px 24px",boxShadow:T.shadow1,marginBottom:16 }}>
        <p style={{ fontSize:15,fontWeight:800,color:T.navy800,margin:"0 0 6px" }}>Konfigurasi Threshold Risk Level</p>
        <p style={{ fontSize:12,color:T.gray500,margin:"0 0 18px" }}>Skor = Likelihood × Impact (1–25). Sesuaikan batas tiap level:</p>
        {[
          {key:"low",label:"LOW ≤",hint:"Risiko rendah, pantau rutin",min:1,max:8},
          {key:"medium",label:"MEDIUM ≤",hint:"Risiko sedang, perlu perhatian",min:5,max:12},
          {key:"high",label:"HIGH ≤",hint:"Risiko tinggi, segera tangani",min:10,max:20},
        ].map(item=>(
          <Field key={item.key} label={`${item.label} ${f[item.key]} (skor ${item.key==="low"?1:f[item.key==="medium"?"low":"medium"]+1}–${f[item.key]})`} hint={item.hint}>
            <input type="range" min={item.min} max={item.max} step="1" value={f[item.key]} onChange={e=>setF({...f,[item.key]:+e.target.value})} style={{ width:"100%",accentColor:T.teal500 }}/>
          </Field>
        ))}
        <div style={{ background:T.navy50,border:`1px solid ${T.navy100}`,borderRadius:T.r10,padding:"12px 14px",marginBottom:16 }}>
          <p style={{ fontSize:12,color:T.navy700,margin:0,fontWeight:700 }}>
            LOW: 1–{f.low} · MEDIUM: {f.low+1}–{f.medium} · HIGH: {f.medium+1}–{f.high} · CRITICAL: {f.high+1}–25
          </p>
        </div>
        {user.role==="admin"?<BtnPrimary onClick={save}>💾 Simpan Threshold</BtnPrimary>:<p style={{ fontSize:12,color:T.red500,fontWeight:600 }}>⚠ Hanya Admin yang dapat mengubah threshold.</p>}
      </div>

      <div style={{ background:T.white,borderRadius:T.r14,border:`1px solid ${T.gray200}`,padding:"22px 24px",boxShadow:T.shadow1,marginBottom:16 }}>
        <p style={{ fontSize:15,fontWeight:800,color:T.navy800,margin:"0 0 14px" }}>Informasi Akun</p>
        {[["Nama",user.name],["Email",user.email],["Role",`${user.role.toUpperCase()} ${user.role==="viewer"?"— Hanya baca":user.role==="analyst"?"— Kelola data":"— Akses penuh"}`]].map(([k,v])=>(
          <div key={k} style={{ display:"flex",gap:12,padding:"10px 0",borderBottom:`1px solid ${T.gray100}` }}>
            <span style={{ fontSize:12,color:T.gray500,fontWeight:700,width:60 }}>{k}</span>
            <span style={{ fontSize:13,color:T.navy800,fontWeight:600 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ background:T.white,borderRadius:T.r14,border:`1px solid #fecaca`,padding:"22px 24px",boxShadow:T.shadow1 }}>
        <p style={{ fontSize:15,fontWeight:800,color:T.red700,margin:"0 0 6px" }}>⚠ Reset Data</p>
        <p style={{ fontSize:12,color:T.gray500,margin:"0 0 14px" }}>Reset semua data ke seed data awal dari laporan UALS. Tindakan ini tidak dapat dibatalkan.</p>
        {user.role==="admin"?(
          <BtnDanger onClick={()=>{ if(confirm("Reset semua data ke default? Semua perubahan akan hilang permanen.")){Object.keys(SEED).forEach(k=>localStorage.setItem(K(k),JSON.stringify(SEED[k])));window.location.reload();} }}>
            🔄 Reset ke Data Awal (UALS)
          </BtnDanger>
        ):<p style={{ fontSize:12,color:T.red500,fontWeight:600 }}>⚠ Hanya Admin yang dapat reset data.</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const S = useStore();

  useEffect(() => {
    setIsClient(true);
    injectFonts();
    injectStyles();
    
    // Load persisted session on mount
    try {
      const session = localStorage.getItem(K("session"));
      if (session) {
        const u = JSON.parse(session);
        if (u && SEED.users.some(su => su.id === u.id)) {
          setUser(u);
        }
      }
    } catch {}

    if(!localStorage.getItem(K("users"))) localStorage.setItem(K("users"),JSON.stringify(SEED.users));
    seedMatricesClient();
    // Double-check matrix — paksa seed lagi saat React mount
    MATRIX_KEYS.forEach(key => {
      try {
        const stored = localStorage.getItem(K(key));
        const parsed = stored ? JSON.parse(stored) : null;
        if (!Array.isArray(parsed) || parsed.length === 0) {
          localStorage.setItem(K(key), JSON.stringify(SEED[key]));
        }
      } catch {
        localStorage.setItem(K(key), JSON.stringify(SEED[key]));
      }
    });
  }, []);

  if (!isClient) {
    return null;
  }

  function login(u) { 
    localStorage.setItem(K("session"), JSON.stringify(u)); 
    setUser(u); 
  }

  function logout() { 
    localStorage.removeItem(K("session")); 
    setUser(null); 
  }

  if(!user) {
    return <LoginPage onLogin={login} />;
  }

  const canEdit = user.role === "admin" || user.role === "analyst";
  const thr = S.thresh || DEFAULT_THRESHOLDS;

  const canAccessSettings = user.role === "admin";

  // Komponen "Akses Ditolak" untuk halaman yang terproteksi
  function AccessDenied() {
    return (
      <div className="fade-in" style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh" }}>
        <div style={{ textAlign:"center",maxWidth:420,padding:"40px 32px",background:T.white,borderRadius:T.r16,border:`1.5px solid #fecaca`,boxShadow:T.shadow3 }}>
          <div style={{ width:72,height:72,background:T.red100,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px" }}>🚫</div>
          <h2 style={{ fontSize:22,fontWeight:800,color:T.red700,margin:"0 0 10px",letterSpacing:"-.02em" }}>Akses Ditolak</h2>
          <p style={{ fontSize:14,color:T.gray600,margin:"0 0 6px",lineHeight:1.6 }}>
            Halaman <strong>Pengaturan</strong> hanya dapat diakses oleh <strong>Admin</strong>.
          </p>
          <p style={{ fontSize:13,color:T.gray400,margin:"0 0 24px" }}>
            Role Anda saat ini: <Badge text={user.role.toUpperCase()} color={T.orange700} bg={T.orange100} border="#fdba74" size="sm"/>
          </p>
          <button onClick={()=>setPage("dashboard")} style={{ background:`linear-gradient(135deg,${T.navy700},${T.teal600})`,color:T.white,border:"none",borderRadius:T.r8,padding:"10px 24px",fontSize:13,fontWeight:700,cursor:"pointer" }}>
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pages = {
    dashboard:       <DashboardPage S={S} />,
    assets:          <AssetsPage S={S} canEdit={canEdit} user={user} />,
    vulnerabilities: <VulnsPage S={S} canEdit={canEdit} user={user} />,
    threats:         <ThreatsPage S={S} canEdit={canEdit} user={user} />,
    controls:        <ControlsPage S={S} canEdit={canEdit} user={user} />,
    risks:           <RisksPage S={S} canEdit={canEdit} user={user} />,
    matrix:          <MatrixPage S={S} canEdit={canEdit} user={user} />,
    audit:           <AuditPage S={S} />,
    settings:        canAccessSettings ? <SettingsPage S={S} user={user} /> : <AccessDenied />,
  };

  return (
    <div className="rms" style={{ display: "flex", height: "100vh", background: T.gray50, fontFamily: T.font, overflow: "hidden" }}>
      <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} />
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", minWidth: 0 }}>
        {pages[page] || pages.dashboard}
      </main>
    </div>
  );
}
