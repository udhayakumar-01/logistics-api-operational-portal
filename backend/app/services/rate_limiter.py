import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, Response

# Simple in-memory token bucket rate limiter for demonstration
# Keyed by (client_ip_or_key, window_timestamp)
class RateLimiterService:
    def __init__(self):
        self.request_counts: Dict[str, Tuple[int, float]] = {}
        # Allows manual simulator triggers
        self.force_breach_keys: set = set()

    def is_rate_limited(self, client_identifier: str, limit: int = 100, window_seconds: int = 60) -> Tuple[bool, int, int, int]:
        now = time.time()
        
        if client_identifier in self.force_breach_keys:
            # Clear force breach flag after 1 trigger
            self.force_breach_keys.remove(client_identifier)
            reset_time = int(now + window_seconds)
            return True, limit, 0, reset_time

        count, window_start = self.request_counts.get(client_identifier, (0, now))

        if now - window_start > window_seconds:
            # Reset window
            count = 1
            window_start = now
            self.request_counts[client_identifier] = (count, window_start)
            remaining = limit - 1
            reset_time = int(window_start + window_seconds)
            return False, limit, remaining, reset_time
        else:
            count += 1
            self.request_counts[client_identifier] = (count, window_start)
            remaining = max(0, limit - count)
            reset_time = int(window_start + window_seconds)
            if count > limit:
                return True, limit, 0, reset_time
            return False, limit, remaining, reset_time

    def trigger_simulator_breach(self, client_identifier: str):
        self.force_breach_keys.add(client_identifier)

rate_limiter = RateLimiterService()
