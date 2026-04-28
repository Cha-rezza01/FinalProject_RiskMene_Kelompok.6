"use client";

import { useState } from "react";

// Inline UI components for ColManager (extracted from page.jsx)
const T = {
  gray50: "#f8fafc", gray100: "#f1f5f9", gray200: "#e2e8f0", gray300: "#cbd5e1", gray400: "#94a3b8", gray500: "#64748b", gray600: "#475569",
  navy800: "#1a3358", navy700: "#1e3d6b", teal500: "#14a085", teal600: "#0d7377", red700: "#991b1b",
  r8: "8px", rFull: "9999px"
};

function ErrBanner({ msg }) {
  return msg ? (
    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: T.r8, padding: "10px 14px", color: T.red700, fontSize: 13, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <span>⚠</span> {msg}
    </div>
  ) : null;
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.gray500, marginBottom: 6, letterSpacing: ".03em" }}>
        {label}{required && <span style={{ color: T.red700, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const baseInput = { width: "100%", border: `1.5px solid ${T.gray200}`, borderRadius: T.r8, padding: "10px 13px", fontSize: 13, background: "white", color: T.gray600, transition: "border .15s,box-shadow .15s", fontFamily: "inherit" };
const Inp = (props) => <input style={baseInput} {...props} />;

function BtnPrimary({ children, onClick, disabled }) {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      style={{ 
        background: `linear-gradient(135deg,${T.navy800},${T.teal500})`, 
        color: "white", 
        border: "none", 
        borderRadius: T.r8, 
        padding: "10px 20px", 
        fontSize: 13, 
        fontWeight: 700, 
        cursor: disabled ? "not-allowed" : "pointer", 
        transition: "all .15s", 
        opacity: disabled?.6 : 1, 
        display: "flex", 
        alignItems: "center", 
        gap: 6, 
        whiteSpace: "nowrap" 
      }}
    >
      {children}
    </button>
  );
}

function BtnSecondary({ children, onClick }) {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        background: "white", 
        color: T.navy800, 
        border: `1.5px solid ${T.gray200}`, 
        borderRadius: T.r8, 
        padding: "9px 18px", 
        fontSize: 13, 
        fontWeight: 600, 
        cursor: "pointer", 
        transition: "all .15s", 
        display: "flex", 
        alignItems: "center", 
        gap: 6, 
        whiteSpace: "nowrap" 
      }}
    >
      {children}
    </button>
  );
}

function BtnDanger({ children, onClick, style: extraStyle }) {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        background: "#fff1f2", 
        color: T.red700, 
        border: `1.5px solid #fecaca`, 
        borderRadius: T.r8, 
        padding: "9px 18px", 
        fontSize: 13, 
        fontWeight: 600, 
        cursor: "pointer", 
        transition: "all .15s", 
        display: "flex", 
        alignItems: "center", 
        gap: 6, 
        whiteSpace: "nowrap", 
        ...extraStyle 
      }}
    >
      {children}
    </button>
  );
}

export default function ColManager({ matrixData, setMatrixData, availableCols, matrixType, log, user, onClose }) {
  const [newColId, setNewColId] = useState("");
  const [newColName, setNewColName] = useState("");
  const [err, setErr] = useState("");

  const uniqueCols = Array.from(new Set(matrixData.map(row => row[1]))).sort();

  function addColumn() {
    if (!newColId.trim() || !newColName.trim()) {
      setErr("ID dan Nama kolom wajib diisi");
      return;
    }
    if (uniqueCols.includes(newColId)) {
      setErr(`Kolom ID "${newColId}" sudah ada`);
      return;
    }
    if (availableCols.find(c => c.id === newColId)) {
      setErr(`ID "${newColId}" sudah digunakan di data master`);
      return;
    }

    // Add new column with value 0 for all existing rows
    const rows = Array.from(new Set(matrixData.map(row => row[0])));
    const updates = rows.map(rowId => [rowId, newColId, 0]);
    const nextData = [...matrixData, ...updates];
    setMatrixData(nextData);
    log(user, "ADD_COLUMN", `Matrix_${matrixType}`, newColId, newColName);
    setNewColId("");
    setNewColName("");
    setErr("");
  }

  function removeColumn(colId) {
    const colInfo = availableCols.find(c => c.id === colId);
    const colName = colInfo ? colInfo.name : "Unknown";
    const confirmMsg = `Hapus kolom "${colName}" (${colId})?\nSemua sel di kolom ini akan hilang.`;
    if (!confirm(confirmMsg)) return;

    const nextData = matrixData.filter(row => row[1] !== colId);
    setMatrixData(nextData);
    log(user, "REMOVE_COLUMN", `Matrix_${matrixType}`, colId, colName);
  }

  return (
    <div style={{ maxHeight: "70vh", overflow: "auto" }}>
      <ErrBanner msg={err} />
      
      {/* Add new column */}
      <div style={{ marginBottom: 20, padding: "16px", background: T.gray50, borderRadius: T.r8, border: `1px solid ${T.gray200}` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.navy800, margin: "0 0 12px" }}>➕ Tambah Kolom Baru</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12 }}>
          <Field label="Kolom ID (unik)" required>
            <Inp value={newColId} onChange={e => setNewColId(e.target.value)} placeholder="ct99" />
          </Field>
          <Field label="Nama Kolom" required>
            <Inp value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Kontrol Baru" />
          </Field>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
            <BtnPrimary onClick={addColumn}>Tambah</BtnPrimary>
            <p style={{ fontSize: 11, color: T.gray500, margin: 0 }}>Nilai default: 0 untuk semua baris</p>
          </div>
        </div>
      </div>

      {/* Current columns list */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.navy800, margin: "0 0 12px" }}>
          📋 Kolom Saat Ini ({uniqueCols.length})
        </p>
        {uniqueCols.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: T.gray400, fontSize: 12 }}>
            Belum ada kolom. Tambah kolom pertama!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "300px", overflow: "auto" }}>
            {uniqueCols.map(colId => {
              const colInfo = availableCols.find(c => c.id === colId);
              return (
                <div key={colId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: T.r8, border: `1px solid ${T.gray200}`, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.navy800, margin: 0 }}>
                      {colId}
                    </p>
                    <p style={{ fontSize: 12, color: T.gray500, margin: "2px 0 0" }}>
                      {colInfo ? colInfo.name : "Kolom custom"}
                    </p>
                  </div>
                  <BtnDanger onClick={() => removeColumn(colId)} style={{ padding: "6px 12px", fontSize: 12 }}>
                    Hapus
                  </BtnDanger>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <BtnSecondary onClick={onClose}>Tutup</BtnSecondary>
      </div>
    </div>
  );
}
