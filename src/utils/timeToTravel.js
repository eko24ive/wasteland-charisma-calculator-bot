const timeToTravel = (stamina, distance) => {
  const walkTime = 120;
  const fightTime = 20;
  const regenTime = 60 * 30;

  const totalWalkTime = Math.round(distance * walkTime + distance * fightTime);

  const rest = distance % stamina;
  const cycles = Math.max(Math.floor(distance / stamina) - (rest === 0 ? 1 : 0), 0);
  const cycleRegenTime = Math.max(regenTime - (stamina * walkTime + stamina * fightTime), 0);
  const totalRegenTime = cycleRegenTime * cycles;

  return Math.round(totalWalkTime + totalRegenTime);
};

module.exports = timeToTravel;

