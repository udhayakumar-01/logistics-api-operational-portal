import csv
import json
import os
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.models import Seller, Warehouse, Carrier, Inventory, Shipment, ShipmentEvent, ApiRequest, ApiError, RateLimitRule

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")

def seed_database_from_csv(db: Session = None):
    close_at_end = False
    if db is None:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_at_end = True
    else:
        # Clear existing tables
        db.query(ShipmentEvent).delete()
        db.query(Shipment).delete()
        db.query(Inventory).delete()
        db.query(Carrier).delete()
        db.query(Warehouse).delete()
        db.query(Seller).delete()
        db.query(ApiRequest).delete()
        db.query(ApiError).delete()
        db.query(RateLimitRule).delete()
        db.commit()

    print("Seeding SQLite database from CSV dataset...")

    # 1. Sellers
    sellers_path = os.path.join(DATA_DIR, "sellers.csv")
    if os.path.exists(sellers_path):
        with open(sellers_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            sellers = [Seller(**row) for row in reader]
            db.bulk_save_objects(sellers)
            print(f"  [+] Seeded {len(sellers)} Sellers")

    # 2. Warehouses
    wh_path = os.path.join(DATA_DIR, "warehouses.csv")
    if os.path.exists(wh_path):
        with open(wh_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            whs = []
            for r in reader:
                r["capacity"] = int(r["capacity"])
                r["current_occupancy"] = int(r["current_occupancy"])
                whs.append(Warehouse(**r))
            db.bulk_save_objects(whs)
            print(f"  [+] Seeded {len(whs)} Warehouses")

    # 3. Carriers
    car_path = os.path.join(DATA_DIR, "carriers.csv")
    if os.path.exists(car_path):
        with open(car_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            cars = []
            for r in reader:
                r["active_vehicles"] = int(r["active_vehicles"])
                cars.append(Carrier(**r))
            db.bulk_save_objects(cars)
            print(f"  [+] Seeded {len(cars)} Carriers")

    # 4. Inventory
    inv_path = os.path.join(DATA_DIR, "inventory.csv")
    if os.path.exists(inv_path):
        with open(inv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            invs = []
            for r in reader:
                r["quantity"] = int(r["quantity"])
                r["reorder_level"] = int(r["reorder_level"])
                invs.append(Inventory(**r))
            db.bulk_save_objects(invs)
            print(f"  [+] Seeded {len(invs)} Inventory items")

    # 5. Shipments
    shp_path = os.path.join(DATA_DIR, "shipments.csv")
    if os.path.exists(shp_path):
        with open(shp_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            shps = []
            for r in reader:
                r["current_sequence"] = int(r["current_sequence"])
                r["duplicate_event_count"] = int(r["duplicate_event_count"])
                r["out_of_order_event_count"] = int(r["out_of_order_event_count"])
                r["delayed_event_count"] = int(r["delayed_event_count"])
                shps.append(Shipment(**r))
            db.bulk_save_objects(shps)
            print(f"  [+] Seeded {len(shps)} Shipments")

    # 6. Shipment Events
    evt_path = os.path.join(DATA_DIR, "shipment_events.csv")
    if os.path.exists(evt_path):
        with open(evt_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            evts = []
            for r in reader:
                r["sequence_number"] = int(r["sequence_number"])
                evts.append(ShipmentEvent(**r))
            # Insert in chunks to avoid memory/SQLite limitations
            chunk_size = 2000
            for i in range(0, len(evts), chunk_size):
                db.bulk_save_objects(evts[i:i+chunk_size])
            print(f"  [+] Seeded {len(evts)} Shipment Events")

    # 7. API Requests
    req_path = os.path.join(DATA_DIR, "api_requests.csv")
    if os.path.exists(req_path):
        with open(req_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            reqs = []
            for r in reader:
                r["status_code"] = int(r["status_code"])
                r["latency_ms"] = int(r["latency_ms"])
                reqs.append(ApiRequest(**r))
            db.bulk_save_objects(reqs)
            print(f"  [+] Seeded {len(reqs)} API Requests")

    # 8. API Errors
    err_path = os.path.join(DATA_DIR, "api_errors.csv")
    if os.path.exists(err_path):
        with open(err_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            errs = [ApiError(**r) for r in reader]
            db.bulk_save_objects(errs)
            print(f"  [+] Seeded {len(errs)} API Errors")

    # 9. Rate Limits
    rl_path = os.path.join(DATA_DIR, "rate_limits.csv")
    if os.path.exists(rl_path):
        with open(rl_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rules = []
            for r in reader:
                r["requests_per_minute"] = int(r["requests_per_minute"])
                r["burst_per_second"] = int(r["burst_per_second"])
                r["concurrent_connections"] = int(r["concurrent_connections"])
                rules.append(RateLimitRule(**r))
            db.bulk_save_objects(rules)
            print(f"  [+] Seeded {len(rules)} Rate Limit rules")

    db.commit()
    print("Database seeding completed successfully!")
    if close_at_end:
        db.close()

if __name__ == "__main__":
    seed_database_from_csv()
