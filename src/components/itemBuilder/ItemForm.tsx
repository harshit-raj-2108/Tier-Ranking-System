import { useState, type FormEvent } from "react";
import { Button } from "../shared/Button";
import styles from "./ItemForm.module.css";

export interface ItemFormValues {
  name: string;
  imageUrl?: string;
  note?: string;
}

interface ItemFormProps {
  initial?: ItemFormValues;
  submitLabel: string;
  onSubmit: (values: ItemFormValues) => void;
  onCancel?: () => void;
}

export function ItemForm({ initial, submitLabel, onSubmit, onCancel }: ItemFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const isEdit = Boolean(initial);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSubmit({
      name: trimmedName,
      imageUrl: imageUrl.trim() || undefined,
      note: note.trim() || undefined,
    });

    if (!isEdit) {
      setName("");
      setImageUrl("");
      setNote("");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.nameInput}
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus={isEdit}
      />
      <input
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className={styles.actions}>
        <Button type="submit" disabled={!name.trim()}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
