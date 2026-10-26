// Pravi PDF sa ekranima prototipa (jedan ekran po strani, opis funkcije ispod slike).
// Pokretanje: u jednom terminalu `npm run dev`, u drugom `npm run pdf`.
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173/#/'
const OUT = 'docs'
fs.mkdirSync(`${OUT}/screens`, { recursive: true })

const shots = []
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const wait = ms => page.waitForTimeout(ms)

async function go(hash) {
    await page.evaluate(h => { location.hash = h }, hash)
    await wait(900)
}

async function snap(title, desc) {
    await wait(300)
    const file = `${OUT}/screens/${String(shots.length + 1).padStart(2, '0')}.png`
    await page.screenshot({ path: file })
    shots.push({ title, desc, file })
}

// Svež početak: prazan localStorage, pa se ponovo učitaju demo podaci
await page.goto(BASE)
await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
await page.reload()
await wait(3000) // pauza da se učitaju fotografije biljaka

await snap('Početna stranica i pregled biljaka', 'Funkcija: Ručni pregled predefinisanog skupa biljaka i pretraga. Za svaku biljku prikazani su slika, naziv, ocena, tip i cena, uz akcije Detalji i Rezerviši. Gost može slobodno da pregleda sadržaj.')

await page.selectOption('#type', 'baštenska')
await page.fill('#pmax', '700')
await snap('Pretraga biljaka', 'Funkcija: Pretraga biljaka. Kriterijumi se zadaju odvojeno (naziv, opis, tip, ciljna grupa, datum proizvodnje, cena, ocena i tekst recenzije). Rezultat se odmah osvežava, uz broj prikazanih biljaka i mogućnost poništavanja pretrage.')

await go('#/details/3')
await wait(2000)
await snap('Detalji biljke i recenzije', 'Funkcija: Detaljan prikaz biljke: opis sa sadnjom i negom, tip, ciljna grupa, datum proizvodnje, cena, istaknuta prosečna ocena zvezdicama i recenzije kupaca koji su biljku naručili.')

await page.click('text=Rezerviši biljku')
await wait(600)
await snap('Zahtev za prijavu pri rezervaciji', 'Funkcija: Pokušaj rezervacije bez prijave. Dijalog objašnjava da je potrebna prijava ili registracija, a izabrana biljka se pamti i dodaje se čim korisnik završi prijavu.')

await page.click('.swal2-deny')
await wait(600)
await page.click('button[type=submit]')
await page.fill('#fullName', 'Dino')
await page.fill('#password', '123')
await page.click('button[type=submit]')
await snap('Registracija sa proverom unosa', 'Funkcija: Registracija novog kupca. Obavezni su svi podaci profila (ime i prezime, e-pošta, telefon, adresa, omiljene vrste, lozinka). Pogrešan ili prazan unos prikazuje poruku uz polje sa objašnjenjem kako da se ispravi.')

await go('#/login')
await snap('Prijava', 'Funkcija: Prijava postojećeg korisnika. Prikazuje se obaveštenje da će prekinuta rezervacija biti dodata nakon prijave, a pogrešni podaci daju poruku o grešci.')

await page.fill('#email', 'demo@cvetnabasta.rs')
await page.fill('#password', 'demo12345')
await page.click('button[type=submit]')
await wait(800)
await snap('Obaveštenje o rezervaciji', 'Funkcija: Nastavak prekinute rezervacije posle prijave. Korisnik dobija obaveštenje da je biljka dodata u korpu rezervacija i bira da li da otvori korpu ili nastavi pregled.')

await page.click('.swal2-confirm')
await wait(1800)
await snap('Korpa rezervacija', 'Funkcija: Korpa rezervacija. Prikazuje sve podatke o rezervisanim biljkama, status (rezervisano, pristiglo, otkazano), ocenu i automatski računa ukupnu cenu bez otkazanih stavki. Dostupne opcije zavise od statusa.')

await page.locator("button:has-text('Izmeni')").first().click()
await wait(500)
await snap('Izmena rezervacije', 'Funkcija: Izmena podataka rezervisane biljke (količina i napomena). Moguća je samo za status „rezervisano“, uz proveru unosa.')
await page.click('.swal2-cancel')
await wait(400)

await page.locator("button:has-text('Oceni')").first().click()
await wait(500)
await snap('Ocenjivanje biljke', 'Funkcija: Ocenjivanje biljke ocenom od 1 do 5 uz opisne oznake. Dostupno samo za biljke koje je korisnik rezervisao i koje imaju status „pristiglo“.')
await page.click('.swal2-cancel')
await wait(400)

await page.locator("button:has-text('Obriši')").first().click()
await wait(500)
await snap('Potvrda brisanja', 'Funkcija: Brisanje biljke iz korpe. Dozvoljeno samo za status „pristiglo“; dijalog traži potvrdu. Za ostale statuse dugme je onemogućeno uz objašnjenje.')
await page.click('.swal2-cancel')
await wait(400)

await go('#/user')
await snap('Profil korisnika', 'Funkcija: Lični profil kupca: ime i prezime, kontakt podaci, omiljene vrste biljaka i podaci za prijavu. Svi podaci se mogu menjati, a lozinka se menja posebnim obrascem.')

await go('#/')
await wait(2000)
await page.selectOption('#sort', 'price-asc')
await snap('Sortiranje i preporuke', 'Funkcija: Sortiranje prikazanih biljaka po ceni, oceni ili datumu proizvodnje. Prijavljenom korisniku se biljke koje odgovaraju omiljenim vrstama iz profila označavaju oznakom „Za vas“.')

await page.selectOption('#sort', '')
await page.click('.chatbot-toggle')
await page.click('text=Preporuči mi biljku')
await wait(900)
await page.click('text=Sunčan balkon')
await wait(900)
await snap('Dijalog sa agentom', 'Funkcija: Simulirani dijalog sa agentom po unapred definisanom stablu: pomoć pri rezervaciji, nega biljaka, preporuka biljke prema mestu i objašnjenje statusa. Korisnik bira ponuđene opcije ili ukucava pitanje, a agent nudi prečice ka biljkama i korpi.')

// Sastavljanje PDF-a: jedna slika po strani, opis ispod
const pages = shots.map((s, i) => {
    const b64 = fs.readFileSync(s.file).toString('base64')
    return `<section><h2>${i + 1}. ${s.title}</h2><img src="data:image/png;base64,${b64}"><p>${s.desc}</p></section>`
}).join('')

const html = `<html><head><meta charset="utf-8"><style>
@page { size: A4 landscape; margin: 10mm }
body { font-family: Arial, sans-serif; margin: 0 }
section { page-break-after: always }
h2 { font-size: 15pt; margin: 0 0 6px }
img { display: block; max-width: 100%; max-height: 145mm; margin: 0 auto; border: 1px solid #bbb }
p { font-size: 11pt; margin: 8px 0 0 }
</style></head><body>${pages}</body></html>`

await page.setContent(html)
await page.pdf({ path: `${OUT}/PDKI_prototip_ekrani.pdf`, format: 'A4', landscape: true, printBackground: true })
await browser.close()
console.log(`Gotovo: ${OUT}/PDKI_prototip_ekrani.pdf (${shots.length} ekrana)`)
