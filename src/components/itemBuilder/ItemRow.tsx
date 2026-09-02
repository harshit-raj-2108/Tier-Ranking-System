import type { RankingItem } from "../../types";
import { Button } from "../shared/Button";
import { ItemForm, type ItemFormValues } from "./ItemForm";
import styles from "./ItemRow.module.css";

interface ItemRowProps {
  item: RankingItem;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (values: ItemFormValues) => void;
  onRemove: () => void;
}

export function ItemRow({
  item,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onRemove,
}: ItemRowProps) {
  if (isEditing) {
    return (
      <li className={styles.row}>
        <ItemForm
          initial={{ name: item.name, imageUrl: item.imageUrl, note: item.note }}
          submitLabel="Save"
          onSubmit={onSave}
          onCancel={onCancelEdit}
        />
      </li>
    );
  }

  return (
    <li className={styles.row}>
      {item.imageUrl ? (
        <img className={styles.thumb} src={item.imageUrl} alt="" />
      ) : (
        <div className={styles.thumbPlaceholder} aria-hidden="true" />
      )}
      <div className={styles.info}>
        <span className={styles.name}>{item.name}</span>
        {item.note && <span className={styles.note}>{item.note}</span>}
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onStartEdit}>
          Edit
        </Button>
        <Button variant="ghost" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </li>
  );
}
