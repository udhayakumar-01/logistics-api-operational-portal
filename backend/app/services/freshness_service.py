from datetime import datetime, timezone

def calculate_freshness(last_updated_iso: str) -> str:
    if not last_updated_iso:
        return "MISSING"
    try:
        t_last = datetime.fromisoformat(last_updated_iso.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff_seconds = (now - t_last).total_seconds()
        
        if diff_seconds < 120:
            return "FRESH"
        elif diff_seconds < 900:
            return "STALE"
        else:
            return "MISSING"
    except Exception:
        return "UNKNOWN"
