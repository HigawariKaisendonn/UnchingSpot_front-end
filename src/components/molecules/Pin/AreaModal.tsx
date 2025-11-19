import React, { useState } from "react";
import styles from "./PinModal.module.scss";

interface AreaModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

const AreaModal: React.FC<AreaModalProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>エリア名を入力</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="エリア名"
          className={styles.input}
        />
        <div className={styles.buttonRow}>
          <button
            className={styles.confirmButton}
            onClick={() => name.trim() && onSave(name.trim())}
          >保存</button>
          <button className={styles.cancelButton} onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};

export default AreaModal;
