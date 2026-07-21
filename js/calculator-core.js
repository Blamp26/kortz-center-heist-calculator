export function money(value) {
  return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(Number(value) || 0));
}

export function calculatePrimary({ repeatValue, firstWeeklySale, hardMode, sold = true, weeklyMultiplier = 4, hardMultiplier = 1.1 }) {
  if (!sold) return 0;
  const base = Math.max(0, Number(repeatValue) || 0);
  const weekly = firstWeeklySale ? weeklyMultiplier : 1;
  const hard = hardMode ? hardMultiplier : 1;
  return Math.round(base * weekly * hard);
}

function expandItems(items) {
  const expanded = [];
  for (const item of items) {
    const quantity = Math.max(0, Math.floor(Number(item.quantity) || 0));
    for (let index = 0; index < quantity; index += 1) {
      expanded.push({ ...item, instanceId: `${item.id}:${index}` });
    }
  }
  return expanded;
}

function selectBest(items, capacity) {
  const cap = Math.max(0, Math.floor(capacity));
  const dp = Array.from({ length: cap + 1 }, () => null);
  dp[0] = { value: 0, weight: 0, items: [] };

  for (const item of items) {
    const weight = Math.max(0, Math.floor(Number(item.bagPercent) || 0));
    const value = Math.max(0, Number(item.value) || 0);
    if (!weight || weight > cap) continue;

    for (let current = cap; current >= weight; current -= 1) {
      const previous = dp[current - weight];
      if (!previous) continue;
      const candidate = {
        value: previous.value + value,
        weight: previous.weight + weight,
        items: [...previous.items, item],
      };
      const existing = dp[current];
      if (!existing || candidate.value > existing.value || (candidate.value === existing.value && candidate.weight < existing.weight)) {
        dp[current] = candidate;
      }
    }
  }

  return dp.reduce((best, state) => {
    if (!state) return best;
    if (!best || state.value > best.value || (state.value === best.value && state.weight < best.weight)) return state;
    return best;
  }, null) || { value: 0, weight: 0, items: [] };
}

function allRequestedSelected(selected, requested) {
  if (!requested.length) return false;
  const selectedIds = new Set(selected.map((item) => item.instanceId));
  return requested.every((item) => selectedIds.has(item.instanceId));
}

export function optimizeLoot({ items, players, buyerBonus = 50000 }) {
  const playerCount = Math.min(4, Math.max(1, Math.floor(Number(players) || 1)));
  const capacity = playerCount * 100;
  const expanded = expandItems(items);
  const inaccessible = expanded.filter((item) => item.requiresTwoPlayers && playerCount < 2);
  const accessible = expanded.filter((item) => !(item.requiresTwoPlayers && playerCount < 2));
  const requested = accessible.filter((item) => item.requested);

  const free = selectBest(accessible, capacity);
  const freeHasRequest = allRequestedSelected(free.items, requested);
  const freeScore = free.value + (freeHasRequest ? buyerBonus : 0);

  let forced = null;
  if (requested.length) {
    const forcedWeight = requested.reduce((sum, item) => sum + item.bagPercent, 0);
    const forcedValue = requested.reduce((sum, item) => sum + item.value, 0);
    if (forcedWeight <= capacity) {
      const requestedIds = new Set(requested.map((item) => item.instanceId));
      const remainingItems = accessible.filter((item) => !requestedIds.has(item.instanceId));
      const filler = selectBest(remainingItems, capacity - forcedWeight);
      forced = {
        value: forcedValue + filler.value,
        weight: forcedWeight + filler.weight,
        items: [...requested, ...filler.items],
      };
    }
  }

  const forcedScore = forced ? forced.value + buyerBonus : -1;
  const best = forcedScore > freeScore ? forced : free;
  const buyerRequestCompleted = forcedScore > freeScore ? true : freeHasRequest;

  return {
    capacity,
    used: best.weight,
    remaining: capacity - best.weight,
    secondaryValue: best.value,
    buyerBonusValue: buyerRequestCompleted ? buyerBonus : 0,
    buyerRequestCompleted,
    selected: best.items,
    inaccessible,
    requestedCount: requested.length,
  };
}

export function calculateSummary({ primary, optimization, eliteCompleted, hardMode, eliteBonus, valueLoss, planningFee }) {
  const elite = eliteCompleted ? (hardMode ? eliteBonus.hard : eliteBonus.normal) : 0;
  const loss = Math.max(0, Number(valueLoss) || 0);
  const fee = Math.max(0, Number(planningFee) || 0);
  const gross = primary + optimization.secondaryValue + optimization.buyerBonusValue + elite;
  return {
    primary,
    secondary: optimization.secondaryValue,
    buyerBonus: optimization.buyerBonusValue,
    elite,
    gross,
    valueLoss: loss,
    planningFee: fee,
    net: Math.max(0, gross - loss - fee),
  };
}
