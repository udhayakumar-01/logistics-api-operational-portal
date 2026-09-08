def test_rate_limiter_simulator_breach(client, auth_headers):
    # Arm simulator to trigger rate limit breach for auth_headers key
    arm_res = client.post("/api/v1/simulator/trigger-limit", headers=auth_headers)
    assert arm_res.status_code == 200

    # Next request must return HTTP 429
    limited_res = client.get("/api/v1/shipments/SHP-0001", headers=auth_headers)
    assert limited_res.status_code == 429
    assert "Retry-After" in limited_res.headers
    data = limited_res.json()
    assert data["error_code"] == "RATE_LIMIT_EXCEEDED"
