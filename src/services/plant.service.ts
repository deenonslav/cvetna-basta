import type { PlantModel, ReviewModel } from "@/models/plant.model"
import axios from "axios"
import { UserService } from "./user.service"

// Unapred definisan skup biljaka (simulacija baze podataka)
const PLANTS: PlantModel[] = [
    {
        id: 1, name: 'Monstera', latin: 'Monstera deliciosa', wikiTitle: 'Monstera_deliciosa',
        description: 'Tropska penjačica sa velikim, prorezanim listovima. Dekorativna i otporna.',
        planting: 'Posaditi u lonac sa drenažom i rastresitom zemljom; presađivati na dve godine.',
        care: 'Svetlo bez direktnog sunca, zalivanje kada se gornji sloj zemlje osuši.',
        types: ['sobna', 'tropska', 'cele godine'], targetGroups: ['početnici', 'uređenje doma'],
        producedAt: '2026-08-12', price: 1890,
        reviews: [
            { author: 'Marija', rating: 5, text: 'Stigla zdrava i već je pustila novi list.' },
            { author: 'Nikola', rating: 4, text: 'Lepa, ali veća nego što sam očekivao.' }]
    },
    {
        id: 2, name: 'Lavanda', latin: 'Lavandula angustifolia', wikiTitle: 'Lavandula',
        description: 'Mirisna mediteranska biljka, privlači pčele i odlična je za bordure.',
        planting: 'Sunčano mesto, propusno tlo, razmak između sadnica oko 40 cm.',
        care: 'Retko zalivanje, orezivanje odmah posle cvetanja.',
        types: ['baštenska', 'mediteranska', 'leto'], targetGroups: ['baštovani', 'pčelari'],
        producedAt: '2026-09-03', price: 650,
        reviews: [{ author: 'Jelena', rating: 5, text: 'Prelepo miriše, pčele je obožavaju.' }]
    },
    {
        id: 3, name: 'Ruža', latin: 'Rosa × hybrida', wikiTitle: 'Rose',
        description: 'Klasična cvetnica krupnih cvetova, pogodna i za rezano cveće.',
        planting: 'Sadi se u proleće ili jesen, u zemlju obogaćenu stajnjakom.',
        care: 'Redovno zalivanje, uklanjanje uvelih cvetova i orezivanje u rano proleće.',
        types: ['rezana', 'baštenska', 'umerena', 'proleće'], targetGroups: ['poklon', 'ljubitelji cveća'],
        producedAt: '2026-07-21', price: 790,
        reviews: [
            { author: 'Ana', rating: 4, text: 'Divni cvetovi, malo je osetljiva na sušu.' },
            { author: 'Petar', rating: 5, text: 'Savršen poklon.' }]
    },
    {
        id: 4, name: 'Ehevarija', latin: 'Echeveria elegans', wikiTitle: 'Echeveria',
        description: 'Sukulent u obliku ruže od mesnatih listova, gotovo bez održavanja.',
        planting: 'Kaktus zemlja i plitka saksija sa otvorom za odvod vode.',
        care: 'Mnogo svetla, zalivanje na dve nedelje, zimi još ređe.',
        types: ['sobna', 'sukulent', 'pustinjska'], targetGroups: ['početnici', 'studenti'],
        producedAt: '2026-09-15', price: 420,
        reviews: [{ author: 'Ivana', rating: 5, text: 'Ne traži ništa, a izgleda sjajno.' }]
    },
    {
        id: 5, name: 'Čeri paradajz (seme)', latin: 'Solanum lycopersicum var. cerasiforme', wikiTitle: 'Cherry_tomato',
        description: 'Slatki sitni plodovi, bogat rod. Seme za sopstveni povrtnjak.',
        planting: 'Sejanje u martu u zatvorenom, presađivanje napolje sredinom maja.',
        care: 'Oslonac za stabljiku, redovno zalivanje i prihrana.',
        types: ['baštenska', 'povrtna', 'umerena', 'proleće'], targetGroups: ['porodice', 'baštovani'],
        producedAt: '2026-08-30', price: 250,
        reviews: [{ author: 'Milan', rating: 4, text: 'Klijavost odlična.' }]
    },
    {
        id: 6, name: 'Orhideja', latin: 'Phalaenopsis', wikiTitle: 'Phalaenopsis',
        description: 'Elegantna orhideja koja cveta mesecima, idealna za poklon.',
        planting: 'Supstrat od kore drveta u providnom loncu.',
        care: 'Potapanje korena jednom nedeljno, svetlo bez direktnog sunca.',
        types: ['sobna', 'tropska', 'cele godine'], targetGroups: ['iskusni', 'poklon'],
        producedAt: '2026-08-01', price: 2490,
        reviews: [
            { author: 'Sara', rating: 5, text: 'Cveta već treći mesec.' },
            { author: 'Dragan', rating: 3, text: 'Lepa, ali zahteva pažnju.' }]
    },
    {
        id: 7, name: 'Tulipan (lukovice)', latin: 'Tulipa gesneriana', wikiTitle: 'Tulip',
        description: 'Prolećnica jarkih boja, sadi se u jesen kao lukovica.',
        planting: 'Oktobar–novembar, na dubinu od oko 15 cm, sunčano mesto.',
        care: 'Umereno zalivanje bez prelivanja; lišće ostaviti da uvene prirodno.',
        types: ['baštenska', 'umerena', 'jesen'], targetGroups: ['baštovani', 'ljubitelji cveća'],
        producedAt: '2026-09-20', price: 540,
        reviews: [{ author: 'Mina', rating: 4, text: 'Lukovice krupne i zdrave.' }]
    },
    {
        id: 8, name: 'Aloja vera', latin: 'Aloe vera', wikiTitle: 'Aloe_vera',
        description: 'Lekovita sukulentna biljka, gel iz listova koristi se u nezi kože.',
        planting: 'Peskovita zemlja, saksija sa dobrom drenažom.',
        care: 'Svetlo mesto, zalivanje na 10–14 dana.',
        types: ['sobna', 'sukulent', 'cele godine'], targetGroups: ['početnici', 'kuhinja'],
        producedAt: '2026-09-05', price: 560,
        reviews: [{ author: 'Luka', rating: 5, text: 'Odlična za opekotine.' }]
    },
    {
        id: 9, name: 'Bosiljak', latin: 'Ocimum basilicum', wikiTitle: 'Basil',
        description: 'Aromatična začinska biljka, nezamenljiva u mediteranskoj kuhinji.',
        planting: 'Seme plitko u toplu zemlju, prozor okrenut jugu.',
        care: 'Često zalivanje, skraćivanje vrhova podstiče grananje.',
        types: ['začinska', 'sobna', 'baštenska', 'leto'], targetGroups: ['kuvari', 'početnici'],
        producedAt: '2026-09-25', price: 180,
        reviews: [{ author: 'Teodora', rating: 5, text: 'Svež bosiljak za svaku testeninu.' }]
    },
    {
        id: 10, name: 'Fikus Benjamin', latin: 'Ficus benjamina', wikiTitle: 'Ficus_benjamina',
        description: 'Visoka sobna biljka gustog lišća, popularna u kancelarijama.',
        planting: 'Veći lonac sa drenažom, presađivanje svake druge godine.',
        care: 'Stabilno mesto bez promaje, umereno zalivanje.',
        types: ['sobna', 'tropska', 'cele godine'], targetGroups: ['kancelarije', 'uređenje doma'],
        producedAt: '2026-07-10', price: 1450,
        reviews: [
            { author: 'Vuk', rating: 4, text: 'Osveži vazduh u kancelariji.' },
            { author: 'Katarina', rating: 2, text: 'Odbacio je lišće posle premeštanja.' }]
    }
]

// Slike pravih biljaka se dobavljaju sa Vikipedije (isti princip kao FlightService)
const imageCache = new Map<string, Promise<string[]>>()

export class PlantService {
    static getAll(): PlantModel[] {
        return PLANTS
    }

    static getById(id: number): PlantModel | undefined {
        return PLANTS.find(p => p.id === id)
    }

    static getTypes(): string[] {
        return Array.from(new Set(PLANTS.flatMap(p => p.types))).sort()
    }

    static getTargetGroups(): string[] {
        return Array.from(new Set(PLANTS.flatMap(p => p.targetGroups))).sort()
    }

    // Recenzije: unapred definisane + ocene korisnika sa statusom 'pristiglo'
    static getReviews(plant: PlantModel): ReviewModel[] {
        const own: ReviewModel[] = []
        for (const user of UserService.getUsers()) {
            for (const r of user.reservations) {
                if (r.plantId === plant.id && r.status === 'pristiglo' && r.rating) {
                    own.push({ author: user.fullName, rating: r.rating, text: 'Ocena kupca.' })
                }
            }
        }
        return [...plant.reviews, ...own]
    }

    static getAverage(plant: PlantModel): number {
        const reviews = this.getReviews(plant)
        return reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1)
    }

    // Vraća listu kandidata (veća slika pa manja), prazna lista ako nema mreže
    static getImageUrls(title: string): Promise<string[]> {
        if (!imageCache.has(title)) {
            imageCache.set(title, axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`)
                .then(rsp => {
                    const small: string | undefined = rsp.data.thumbnail?.source
                    if (!small) return []
                    return [small.replace(/\/\d+px-/, '/500px-'), small]
                })
                .catch(() => []))
        }
        return imageCache.get(title)!
    }
}
