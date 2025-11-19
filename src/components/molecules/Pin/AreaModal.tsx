import React, { useState } from "react";
import styles from "./PinModal.module.scss";

interface AreaModalProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

const AreaModal: React.FC<AreaModalProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState("");

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>エリア名を入力</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="エリア名"
        />
        <div className={styles.actions}>
          <button
            className={styles.save}
            onClick={() => name.trim() && onSave(name.trim())}
          >保存</button>
          <button className={styles.cancel} onClick={onCancel}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};

export default AreaModal;
