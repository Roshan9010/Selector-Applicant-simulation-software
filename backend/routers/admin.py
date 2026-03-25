import logging
from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import re
from typing import List, Optional

logger = logging.getLogger("backend.routers.admin")
logger.debug("backend.routers.admin: import start")

router = APIRouter(prefix="/admin", tags=["admin"])


def parse_email_log(path: Path) -> List[dict]:
    if not path.exists():
        return []

    text = path.read_text(encoding='utf-8')
    # Split by separators '---' that we write between entries
    parts = [p.strip() for p in re.split(r"^---$", text, flags=re.MULTILINE) if p.strip()]
    entries = []
    token_re = re.compile(r"token=([0-9a-fA-F\-]+)")
    for part in parts:
        to_match = re.search(r"^To:\s*(.+)$", part, flags=re.MULTILINE)
        subj_match = re.search(r"^Subject:\s*(.+)$", part, flags=re.MULTILINE)
        body_split = re.split(r"\n\s*\n", part, maxsplit=1)
        body = body_split[1].strip() if len(body_split) > 1 else ''

        token = None
        link_match = token_re.search(part)
        if link_match:
            token = link_match.group(1)

        entry = {
            'to': to_match.group(1).strip() if to_match else None,
            'subject': subj_match.group(1).strip() if subj_match else None,
            'body': body,
            'token': token,
        }
        entries.append(entry)

    return entries


@router.get('/invitations')
def get_invitations(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search term for to/subject/body/token"),
):
    """Return parsed invitations from the local email log file (development).

    Supports optional search (`q`) and pagination (`page`, `per_page`).
    """
    log_path = Path(__file__).parent.parent / 'email_log.txt'
    try:
        entries = parse_email_log(log_path)

        # Filter by search query if provided
        if q:
            q_lower = q.lower()
            def matches(e: dict) -> bool:
                return any((str(e.get(k) or '').lower().find(q_lower) != -1) for k in ('to', 'subject', 'body', 'token'))
            entries = [e for e in entries if matches(e)]

        total = len(entries)
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        items = entries[start:end]
        total_pages = (total + per_page - 1) // per_page if per_page else 1

        return {
            'invitations': items,
            'page': page,
            'per_page': per_page,
            'total': total,
            'total_pages': total_pages,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
