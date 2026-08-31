import requests
import json

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json"
}

clips = []
seen_ids = set()
target_count = 100

print("Pulling direct Vayimaen video clips from API...")

# Fetch Vayimaen specific uploads (Organization 115)
for offset in range(0, target_count, 50):
    url = f"https://api.torahanytime.com/lectures?organization=115&limit=50&offset={offset}"
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            data = res.json()
            items = data.get("data", []) if isinstance(data, dict) else data

            for item in items:
                lecture_id = item.get("id")
                if lecture_id and str(lecture_id) not in seen_ids:
                    seen_ids.add(str(lecture_id))
                    clips.append({
                        "id": str(lecture_id),
                        "tatUrl": f"https://www.torahanytime.com/lectures/{lecture_id}"
                    })
    except Exception as e:
        print(f"Error fetching offset {offset}: {e}")

print(f"Total verified Vayimaen clips saved: {len(clips)}")

with open("quotes.json", "w", encoding="utf-8") as f:
    json.dump(clips, f, indent=2)

print("Saved to quotes.json successfully!")
