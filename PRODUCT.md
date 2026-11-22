# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Small and medium producers** in Spain and Latin America who own or run their farm: they draw their parcels, follow crop condition, check the weather and log field work.
- **Technicians and agronomists** who follow several farms and read spectral indices to decide where to go and look in the field.
- **Drone service clients** looking to hire spraying, fertiliser application or aerial seeding.

All three are first-class visitors of the public site.

## Product Purpose
SurcoVisor is a single platform to delimit a farm, monitor crops with satellite spectral indices (NDVI, NDRE, NDMI, EVI, SAVI), check the parcel's weather forecast and keep a field notebook of activities per parcel and campaign. Alongside the software, the same team runs a professional agricultural drone service (spraying, fertilising, aerial seeding). Success: a visitor either opens a platform account or requests a drone job; both actions carry equal weight.

## Positioning
The software is built and backed by people who fly over fields for a living: more than 7 years as an aerial applicator pilot and more than 7,000 ha worked with drones. The platform and the drone service come from the same hands, so the data you read and the work done on the parcel connect.

## Operating Context
- Public site (Spanish) → account login/registration (Supabase auth) → module hub ("Aplicaciones") → modules: Índices (overview, weather, development/NDVI), Notebook (activity log with photos, CSV export), Fincas y parcelas (farm and parcel polygon editor on a Leaflet map), Servicios (request and history of drone fumigations).
- Users work in the office and on the phone in the field; parcel selection (finca → parcela) frames every module.
- Units: hectares; currency USD; dates formatted es-EC.

## Capabilities and Constraints
- Stack: React 19 + Vite + plain CSS, React Router, TanStack Query, Leaflet; backend Fastify + Supabase.
- Satellite observations and modelled weather depend on availability; the UI must say so honestly.
- Spectral index renders are relative values: colours show variation, not causes.

## Brand Commitments
- Name **SurcoVisor** and the **◈** symbol stay.
- Brand green **#113e32** stays as the identity colour.
- Current copy and facts stay as written (story, figures, contacts, locations); redesign may restructure, not rewrite claims.
- Language: Spanish, plain and direct, addressed with "tú".
- Visual preference (user, 2026-11-22): a modern, clean product site at the craft level of Linear and Stripe. Rejected: themed "document" worlds (flight chart, cadastral plan) as too technical, dated and low-impact.

## Evidence on Hand
- Real field media: `public/media/dron-cultivo.jpg`, `public/media/trabajo-dron-01-sin-audio.mp4`, `public/media/trabajo-dron-02-sin-audio.mp4`.
- Real index renders: `public/media/indices/{ndvi,ndre,ndmi,evi,savi}-limpio.jpg`, `src/map-ndvi.png`, `src/map-ndmi.png`.
- Figures: +7 años en el sector agropecuario; +7.000 ha trabajadas con drones.
- Contacts: platform +34 617 358 073 (tel/WhatsApp); drones +54 9 11 6899-8095 (tel/WhatsApp).
- Locations: Madrid (España), Loja (Ecuador), Concordia (Argentina).
- No testimonials, client logos, pricing or press exist: never fabricate them.

## Product Principles
1. Show the field, not the dashboard chrome: real imagery and real index renders lead.
2. Two doors, equal weight: platform account and drone service.
3. Honest data: availability, modelled values and relative scales are stated plainly.
4. Field-ready: legible outdoors on a phone, large targets, no decoration in the way of work.
