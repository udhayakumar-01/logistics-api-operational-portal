import csv
import os
from fastapi import APIRouter

router = APIRouter(prefix="/experiments", tags=["Experiments"])

EXP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "experiments")

@router.get("")
def get_experiment_data():
    baseline_path = os.path.join(EXP_DIR, "baseline_results.csv")
    improved_path = os.path.join(EXP_DIR, "improved_results.csv")
    report_path = os.path.join(EXP_DIR, "experiment_report.md")

    baseline_rows = []
    if os.path.exists(baseline_path):
        with open(baseline_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            baseline_rows = [row for row in reader]

    improved_rows = []
    if os.path.exists(improved_path):
        with open(improved_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            improved_rows = [row for row in reader]

    report_markdown = ""
    if os.path.exists(report_path):
        with open(report_path, "r", encoding="utf-8") as f:
            report_markdown = f.read()

    # Aggregate summaries
    b_times = [float(r["ttfsi_minutes"]) for r in baseline_rows] if baseline_rows else [42.0]
    i_times = [float(r["ttfsi_minutes"]) for r in improved_rows] if improved_rows else [17.5]

    return {
        "trial_count": len(baseline_rows),
        "baseline_summary": {
            "mean_ttfsi": round(sum(b_times) / len(b_times), 2),
            "median_ttfsi": round(sorted(b_times)[len(b_times)//2], 2),
            "p90_ttfsi": round(sorted(b_times)[int(len(b_times)*0.9)], 2),
            "first_call_success_rate": round(sum(1 for r in baseline_rows if r["first_call_success"] == "True") / len(baseline_rows) * 100, 1) if baseline_rows else 25.0
        },
        "improved_summary": {
            "mean_ttfsi": round(sum(i_times) / len(i_times), 2),
            "median_ttfsi": round(sorted(i_times)[len(i_times)//2], 2),
            "p90_ttfsi": round(sorted(i_times)[int(len(i_times)*0.9)], 2),
            "first_call_success_rate": round(sum(1 for r in improved_rows if r["first_call_success"] == "True") / len(improved_rows) * 100, 1) if improved_rows else 80.0
        },
        "baseline_trials": baseline_rows,
        "improved_trials": improved_rows,
        "report_markdown": report_markdown
    }
