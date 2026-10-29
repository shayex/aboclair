import { describe, expect, it } from 'vitest'
import type { Abonnement } from '../types'
import { ajouterMois } from './dates'
import { echapper, genererIcs, nomFichierIcs, plier, prochaineEcheance, rappelsPour } from './ics'

const AUJOURDHUI = '2026-10-29'

function abo(partiel: Partial<Abonnement>): Abonnement {
  return {
    id: 'abc',
    serviceId: 'netflix-standard',
    nom: 'Netflix Standard',
    categorie: 'video',
    prixCentimes: 1499,
    frequence: 'mensuel',
    ...partiel,
  }
}

describe('dates', () => {
  it('reste en fin de mois quand le jour n’existe pas', () => {
    expect(ajouterMois('2026-01-31', 1)).toBe('2026-02-28')
    expect(ajouterMois('2028-01-31', 1)).toBe('2028-02-29')
    expect(ajouterMois('2026-12-15', 1)).toBe('2027-01-15')
  })
})

describe('prochaineEcheance', () => {
  it('garde une date future telle quelle', () => {
    expect(prochaineEcheance('2026-11-20', 'mensuel', AUJOURDHUI)).toBe('2026-11-20')
  })
  it('avance une date passée au prochain mois ou à la prochaine année', () => {
    expect(prochaineEcheance('2026-03-05', 'mensuel', AUJOURDHUI)).toBe('2026-11-05')
    expect(prochaineEcheance('2025-02-10', 'annuel', AUJOURDHUI)).toBe('2027-02-10')
  })
  it('avance de 28 jours en 28 jours pour un prélèvement toutes les 4 semaines', () => {
    expect(prochaineEcheance('2026-10-01', '4-semaines', AUJOURDHUI)).toBe('2026-10-29')
    expect(prochaineEcheance('2026-09-30', '4-semaines', AUJOURDHUI)).toBe('2026-11-25')
  })
  it('ne dérive pas après un mois court', () => {
    expect(prochaineEcheance('2026-01-31', 'mensuel', AUJOURDHUI)).toBe('2026-10-31')
  })
})

describe('rappelsPour', () => {
  it('n’en crée aucun sans date', () => {
    expect(rappelsPour(abo({}), AUJOURDHUI)).toEqual([])
  })
  it('rappelle 2 jours avant la fin de l’essai', () => {
    const [r] = rappelsPour(abo({ finEssai: '2026-11-12' }), AUJOURDHUI)
    expect(r.type).toBe('essai')
    expect(r.date).toBe('2026-11-10')
    expect(r.titre).toBe('Fin de l’essai Netflix Standard le 12 novembre 2026')
  })
  it('rappelle aujourd’hui si la fin d’essai est trop proche, et ignore un essai fini', () => {
    expect(rappelsPour(abo({ finEssai: '2026-10-30' }), AUJOURDHUI)[0].date).toBe(AUJOURDHUI)
    expect(rappelsPour(abo({ finEssai: '2026-10-01' }), AUJOURDHUI)).toEqual([])
  })
  it('rappelle 7 jours avant le renouvellement', () => {
    const [r] = rappelsPour(abo({ dateRenouvellement: '2026-11-20' }), AUJOURDHUI)
    expect(r.date).toBe('2026-11-13')
    expect(r.annuel).toBe(false)
    expect(r.titre).toBe('Netflix Standard se renouvelle le 20 novembre 2026')
  })
  it('répète chaque année le rappel d’un abonnement annuel', () => {
    const [r] = rappelsPour(abo({ frequence: 'annuel', prixCentimes: 7199, dateRenouvellement: '2027-03-01' }), AUJOURDHUI)
    expect(r.date).toBe('2027-02-22')
    expect(r.annuel).toBe(true)
    expect(r.titre).toBe('Netflix Standard se renouvelle dans 7 jours')
  })
  it('ne répète pas un rappel annuel ramené à aujourd’hui', () => {
    const [r] = rappelsPour(abo({ frequence: 'annuel', dateRenouvellement: '2026-11-01' }), AUJOURDHUI)
    expect(r.date).toBe(AUJOURDHUI)
    expect(r.annuel).toBe(false)
  })
  it('crée les deux rappels si les deux dates sont connues', () => {
    const r = rappelsPour(abo({ finEssai: '2026-11-12', dateRenouvellement: '2026-11-12' }), AUJOURDHUI)
    expect(r.map((x) => x.type)).toEqual(['essai', 'renouvellement'])
  })
})

describe('format iCalendar', () => {
  it('échappe les caractères spéciaux', () => {
    expect(echapper('a, b; c\\d\ne')).toBe('a\\, b\; c\\\\d\\ne')
  })
  it('plie les lignes longues à 75 octets sans couper les accents', () => {
    const ligne = 'DESCRIPTION:' + 'é'.repeat(80)
    const plie = plier(ligne)
    const encodeur = new TextEncoder()
    for (const morceau of plie.split('\r\n')) expect(encodeur.encode(morceau).length).toBeLessThanOrEqual(75)
    expect(plie.split('\r\n').slice(1).every((m) => m.startsWith(' '))).toBe(true)
    expect(plie.replace(/\r\n /g, '')).toBe(ligne)
  })
  it('produit un fichier valide avec événement et alarme', () => {
    const rappels = rappelsPour(abo({ finEssai: '2026-11-12' }), AUJOURDHUI)
    const ics = genererIcs(rappels, new Date('2026-10-29T10:00:00Z'))
    const lignes = ics.split('\r\n')
    expect(lignes[0]).toBe('BEGIN:VCALENDAR')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(lignes).toContain('DTSTART;VALUE=DATE:20261110')
    expect(lignes).toContain('DTEND;VALUE=DATE:20261111')
    expect(lignes).toContain('DTSTAMP:20261029T100000Z')
    expect(lignes).toContain('UID:abc-essai@aboclair')
    expect(lignes).toContain('TRIGGER:PT9H')
    expect(ics).not.toMatch(/[^\r]\n/)
  })
  it('donne un nom de fichier lisible', () => {
    expect(nomFichierIcs('L’Équipe (numérique)')).toBe('rappel-l-equipe-numerique.ics')
    expect(nomFichierIcs('!!!')).toBe('rappel-abonnement.ics')
  })
})
