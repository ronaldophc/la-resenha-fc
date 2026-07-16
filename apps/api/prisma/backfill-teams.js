/**
 * Backfill único da migração para o modelo de partidas com times reais:
 *  1. Marca (ou cria) o time "La Resenha" como clube da casa (isOwnClub)
 *  2. Para cada partida legada: mandante = La Resenha, visitante = time
 *     criado/encontrado a partir do nome textual `opponent`
 *
 * Idempotente: pode rodar mais de uma vez sem duplicar nada.
 * Uso: node prisma/backfill-teams.js (a partir de apps/api)
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Clube da casa
  let ownClub = await prisma.team.findFirst({
    where: { name: { contains: 'resenha', mode: 'insensitive' } },
  });
  if (ownClub) {
    if (!ownClub.isOwnClub) {
      ownClub = await prisma.team.update({
        where: { id: ownClub.id },
        data: { isOwnClub: true },
      });
    }
  } else {
    ownClub = await prisma.team.create({
      data: { name: 'La Resenha', isOwnClub: true },
    });
  }
  console.log(`Clube da casa: ${ownClub.name} (id ${ownClub.id})`);

  // 2. Partidas sem vínculo de time
  const legacyMatches = await prisma.match.findMany({
    where: { OR: [{ homeTeamId: null }, { awayTeamId: null }] },
  });
  console.log(`Partidas legadas a migrar: ${legacyMatches.length}`);

  for (const match of legacyMatches) {
    let awayTeamId = match.awayTeamId;
    if (!awayTeamId) {
      const opponentName = (match.opponent || '').trim();
      if (!opponentName) {
        console.warn(`  Partida ${match.id} sem adversário textual — pulando.`);
        continue;
      }
      let opponentTeam = await prisma.team.findFirst({
        where: { name: { equals: opponentName, mode: 'insensitive' } },
      });
      if (!opponentTeam) {
        opponentTeam = await prisma.team.create({ data: { name: opponentName } });
        console.log(`  Time criado: ${opponentTeam.name} (id ${opponentTeam.id})`);
      }
      awayTeamId = opponentTeam.id;
    }

    await prisma.match.update({
      where: { id: match.id },
      data: {
        homeTeamId: match.homeTeamId ?? ownClub.id,
        awayTeamId,
      },
    });

    // Garante inscrição dos dois times se a partida é de campeonato
    if (match.championshipId) {
      for (const teamId of [match.homeTeamId ?? ownClub.id, awayTeamId]) {
        await prisma.standing.upsert({
          where: {
            championshipId_teamId: { championshipId: match.championshipId, teamId },
          },
          create: { championshipId: match.championshipId, teamId },
          update: {},
        });
      }
    }
    console.log(`  Partida ${match.id} migrada.`);
  }

  console.log('Backfill concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
