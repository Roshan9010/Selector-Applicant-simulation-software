#!/usr/bin/env python3
"""Non-destructive SQLite migration to add missing columns used by models.

Adds `is_opened` and `opened_at` to `interview_invitations` if they don't exist.
Run from backend folder: `python migrate_add_columns.py`
"""
from pathlib import Path
import sqlite3
import sys


def main():
    db_path = Path(__file__).parent / 'applicant_sim.db'
    if not db_path.exists():
        print(f"Database not found at {db_path}. Nothing to migrate.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    cur.execute("PRAGMA table_info('interview_invitations')")
    rows = cur.fetchall()
    existing = {r[1] for r in rows}

    changes_made = False

    if 'is_opened' not in existing:
        print('Adding column is_opened (BOOLEAN DEFAULT 0)')
        try:
            cur.execute("ALTER TABLE interview_invitations ADD COLUMN is_opened BOOLEAN DEFAULT 0")
            changes_made = True
        except Exception as e:
            print('Failed to add is_opened:', e)

    if 'opened_at' not in existing:
        print('Adding column opened_at (DATETIME NULL)')
        try:
            cur.execute("ALTER TABLE interview_invitations ADD COLUMN opened_at DATETIME")
            changes_made = True
        except Exception as e:
            print('Failed to add opened_at:', e)

    if changes_made:
        conn.commit()
        print('Migration applied successfully.')
    else:
        print('No migration needed; schema already up-to-date.')

    conn.close()


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('Migration failed with exception:', exc)
        sys.exit(1)
