import argparse
import json
import os
import requests
import sys

BASE_URL = "http://localhost:8000"
API_KEY = "demo-api-key-partner-admin"

def inject_event(event_type, entity_id, sequence_number, is_duplicate=False, is_out_of_order=False, is_delayed=False):
    url = f"{BASE_URL}/api/v1/simulator/inject-event"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    
    payload = {
        "event_type": event_type,
        "entity_id": entity_id,
        "sequence_number": sequence_number,
        "is_duplicate": is_duplicate,
        "is_out_of_order": is_out_of_order,
        "is_delayed": is_delayed
    }
    
    print(f"Injecting event to {url}: {json.dumps(payload, indent=2)}")
    try:
        res = requests.post(url, json=payload, headers=headers)
        print(f"Status Code: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
    except Exception as e:
        print(f"Error connecting to backend server at {BASE_URL}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Inject operational events into the Logistics API backend.")
    parser.add_argument("--type", default="PICKED_UP", help="Event type (PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED)")
    parser.add_argument("--shipment", default="SHP-0001", help="Target Shipment ID")
    parser.add_argument("--seq", type=int, default=2, help="Sequence number")
    parser.add_argument("--duplicate", action="store_true", help="Flag as duplicate event injection")
    parser.add_argument("--out-of-order", action="store_true", help="Flag as out-of-order event injection")
    parser.add_argument("--delayed", action="store_true", help="Flag as delayed event injection")

    args = parser.parse_args()
    inject_event(
        event_type=args.type,
        entity_id=args.shipment,
        sequence_number=args.seq,
        is_duplicate=args.duplicate,
        is_out_of_order=args.out_of_order,
        is_delayed=args.delayed
    )

if __name__ == "__main__":
    main()
