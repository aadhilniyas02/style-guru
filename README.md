# Style-Guru

Style-Guru is an AI-powered outfit recommender for Sri Lankan users.

The mobile app lets users build a digital wardrobe from photos of real clothes, then get occasion- and weather-aware outfit suggestions.

## Tech Stack

- Frontend: React Native + Expo (TypeScript)
- Backend: FastAPI (Python)
- Database/Auth: Supabase (PostgreSQL + Auth)
- AI: Anthropic Claude (outfit and vision reasoning)
- Media: Cloudinary (image hosting)
- Weather: OpenWeatherMap

## Repository Structure

- `app/` Expo Router screens
- `components/` reusable UI components
- `hooks/` auth and wardrobe data hooks
- `lib/` API, Supabase, and weather clients
- `constants/` theme and domain constants
- `StyleGuru-Backend/` FastAPI backend services
- `supabase/` SQL schema and migration scripts

## Local Run

Backend:

```bash
cd StyleGuru-Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
npm install
npm run start
```

Set required environment variables in `.env` files (do not commit secrets).
