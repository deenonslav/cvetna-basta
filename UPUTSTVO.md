# Cvetna bašta: uputstvo za pokretanje i predaju

## 1. Šta ti treba (jednom)
1. **Node.js** verzija 22.18 ili novija (LTS): https://nodejs.org. Proveri u terminalu: `node -v`.
   (Ako koristiš Bun kao na vežbama, možeš `bun install` / `bun dev`.)
2. **VS Code** (ili IntelliJ/WebStorm) i bilo koji pregledač (Chrome).
3. Internet veza, jer se slike biljaka učitavaju sa Vikipedije.

## 2. Pokretanje prototipa
1. Raspakuj `cvetna-basta.zip` i uđi u folder `zb` (ili kako god da se zove).
2. Otvori terminal u tom folderu (VS Code: Terminal → New Terminal).
3. Prvi put: `npm install`
4. Pokreni: `npm run dev`
5. Otvori adresu koju ispiše (obično http://localhost:5173).
6. Zaustavljanje: `Ctrl + C` u terminalu.

**Demo nalog:** `demo@cvetnabasta.rs` / `demo12345` (ima rezervacije u sva tri statusa).

## 3. Šta da isprobaš (za odbranu)
1. Pretraga: popuni više kriterijuma odvojeno (tip, cena do, ocena...) i poništi ih.
2. Klikni Rezerviši kao gost: traži prijavu, a posle prijave se rezervacija sama doda.
3. Korpa: Izmeni i Otkaži (status „rezervisano“), Oceni i Obriši (status „pristiglo“).
4. „Simuliraj dolazak“ pretvara rezervaciju u „pristiglo“ (samo za demonstraciju).
5. Profil: izmena podataka i lozinke. Registracija: pokaži poruke o greškama.
6. Pomoćnik (dugme dole desno): izaberi opciju ili ukucaj npr. „nega“, „rezervacija“, „preporuka“.
7. Posle prijave: sortiranje liste i oznaka „Za vas“ na biljkama koje odgovaraju omiljenim vrstama iz profila.

Podaci se čuvaju u `localStorage`. Za početak ispočetka: F12 → Application → Local Storage → obriši `zb_2026_*`.

## 4. PDF sa ekranima (sa pravim slikama)
Potrebno jednom: `npx playwright install chromium`

1. Terminal 1: `npm run dev` (ostavi da radi).
2. Terminal 2: `npm run pdf`.
3. PDF je u `docs/PDKI_prototip_ekrani.pdf` (14 strana, jedna po strani, opis ispod slike).
4. Otvori ga i proveri da se vide fotografije biljaka. Ako koja nedostaje, ispravi `wikiTitle` te biljke u `src/services/plant.service.ts` i pokreni ponovo.

Ako dev server radi na drugom portu: `BASE_URL="http://localhost:5174/#/" npm run pdf` (u Windows PowerShell: `$env:BASE_URL="http://localhost:5174/#/"; npm run pdf`).

## 5. Predaja
- **Kod:** zipuj projekat BEZ foldera `node_modules` i `dist`.
- **Ili web adresa:** `npm run build`, pa folder `dist` prevuci na https://app.netlify.com/drop i dobijaš link. Build koristi relativne putanje, pa radi na bilo kom hostingu.
- **PDF:** `docs/PDKI_prototip_ekrani.pdf`.
- **Video (opciono, do 5 min):** snimi ekran (Windows: Win + G, ili OBS), postavi na Drive/Dropbox/Vimeo i podeli link.
- Način predaje i rokove objavljuju u timu predmeta.

## 6. Ako nešto ne radi
- `npm install` greši: proveri `node -v` (treba ≥ 22.18).
- Port zauzet: Vite sam predloži sledeći, koristi ispisanu adresu.
- Nema slika: proveri internet; bez njega se prikazuje ikona cveta.
- Bela stranica: otvori F12 → Console i proveri grešku.
