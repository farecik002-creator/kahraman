import { useState, useCallback, useRef } from 'react';
import {
  Board,
  Position,
  PLAYER_MAX_HP,
  PLAYER_MAX_MANA,
  ENEMIES_PER_WAVE,
  createInitialBoard,
  findMatches,
  markMatches,
  dropAndRefill,
  swapTiles,
  isAdjacent,
  calculateEffects,
  getEnemy,
  Effects,
} from '../constants/gameData';

export type GamePhase = 'playing' | 'gameOver' | 'processing';

export interface EnemyState {
  name: string;
  title: string;
  maxHP: number;
  hp: number;
  damage: number;
  iconName: string;
  iconSet: 'mci' | 'ion';
  level: number;
}

export interface FloatMsg {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let floatMsgId = 0;

function buildEnemy(index: number, wave: number): EnemyState {
  const e = getEnemy(index, wave);
  return { ...e, hp: e.maxHP };
}

export function useGameLogic() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [playerHP, setPlayerHP] = useState(PLAYER_MAX_HP);
  const [playerMana, setPlayerMana] = useState(20);
  const [defense, setDefense] = useState(0);
  const [critActive, setCritActive] = useState(false);
  const [wave, setWave] = useState(1);
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [enemy, setEnemy] = useState<EnemyState>(() => buildEnemy(0, 1));
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('The battle begins...');
  const [floatMsgs, setFloatMsgs] = useState<FloatMsg[]>([]);
  const [playerAttacked, setPlayerAttacked] = useState(false);

  const addFloat = useCallback((text: string, color: string, x = 0.5, y = 0.4) => {
    const id = ++floatMsgId;
    setFloatMsgs(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => {
      setFloatMsgs(prev => prev.filter(m => m.id !== id));
    }, 1200);
  }, []);

  const advanceEnemy = useCallback(
    async (currentWave: number, currentEnemyIndex: number) => {
      const nextEnemyIdx = currentEnemyIndex + 1;

      if (nextEnemyIdx >= ENEMIES_PER_WAVE) {
        const nextWave = currentWave + 1;
        const newEnemy = buildEnemy(0, nextWave);
        setWave(nextWave);
        setEnemyIndex(0);
        setEnemy(newEnemy);
        setBoard(createInitialBoard());
        setCombo(0);
        setDefense(0);
        setIsProcessing(false);
        setMessage(`Wave ${nextWave} begins!`);
      } else {
        const newEnemy = buildEnemy(nextEnemyIdx, currentWave);
        setEnemyIndex(nextEnemyIdx);
        setEnemy(newEnemy);
        setBoard(createInitialBoard());
        setCombo(0);
        setDefense(0);
        setIsProcessing(false);
        setMessage(`${newEnemy.name} appears!`);
      }
    },
    []
  );

  const runGameLoop = useCallback(
    async (
      currentBoard: Board,
      pHP: number,
      pMana: number,
      def: number,
      enemyHP: number,
      currentWave: number,
      currentEnemyIdx: number,
      currentCombo: number,
      isCritActive: boolean
    ): Promise<void> => {
      const matches = findMatches(currentBoard);

      if (matches.size === 0) {
        const e = getEnemy(currentEnemyIdx, currentWave);
        const scaled = Math.floor(e.damage * Math.pow(1.25, currentWave - 1));
        const actual = Math.max(0, scaled - def);
        const newPHP = Math.max(0, pHP - actual);

        setPlayerHP(newPHP);
        setDefense(0);
        setCombo(0);
        setPlayerAttacked(true);

        if (actual > 0) {
          addFloat(`-${actual}`, '#ff4444', 0.2, 0.75);
          setMessage(`${e.name} strikes for ${actual} damage!`);
        } else {
          setMessage(`${e.name} attacks — BLOCKED by your shield!`);
        }

        await delay(600);
        setPlayerAttacked(false);

        if (newPHP <= 0) {
          setPhase('gameOver');
          return;
        }

        setIsProcessing(false);
        setMessage('Your turn...');
        return;
      }

      const effects = calculateEffects(currentBoard, matches, currentCombo, isCritActive);
      const markedBoard = markMatches(currentBoard, matches);
      setBoard(markedBoard);

      let totalDamage = 0;
      let totalHeal = 0;
      let totalMana = 0;
      let totalShield = 0;
      let anyCrit = false;

      for (const eff of effects) {
        totalDamage += eff.damage;
        totalHeal += eff.heal;
        totalMana += eff.mana;
        totalShield += eff.shield;
        if (eff.isCrit) anyCrit = true;
      }

      const newEnemyHP = Math.max(0, enemyHP - totalDamage);
      const newPHP = Math.min(PLAYER_MAX_HP, pHP + totalHeal);
      const newPMana = Math.min(PLAYER_MAX_MANA, pMana + totalMana);
      const newDef = def + totalShield;
      const newCombo = currentCombo + 1;

      setEnemy(prev => ({ ...prev, hp: newEnemyHP }));
      setPlayerHP(newPHP);
      setPlayerMana(newPMana);
      setDefense(newDef);
      setCombo(newCombo);

      if (totalDamage > 0) {
        const dmgText = anyCrit ? `CRIT! -${totalDamage}` : `-${totalDamage}`;
        const dmgColor = anyCrit ? '#00ffcc' : '#ffcc00';
        addFloat(dmgText, dmgColor, 0.5, 0.2);
      }
      if (totalHeal > 0) addFloat(`+${totalHeal} HP`, '#ff88bb', 0.15, 0.8);
      if (totalShield > 0) addFloat(`+${totalShield} DEF`, '#7799ff', 0.85, 0.8);
      if (totalMana > 0) addFloat(`+${totalMana} MP`, '#ffdd66', 0.85, 0.7);

      const msgs: string[] = [];
      if (anyCrit && newCombo > 1) msgs.push(`CRITICAL x${newCombo} COMBO!`);
      else if (anyCrit) msgs.push('CRITICAL HIT!');
      else if (newCombo > 1) msgs.push(`x${newCombo} COMBO!`);
      if (totalHeal > 0) msgs.push(`Healed ${totalHeal} HP`);
      if (totalShield > 0) msgs.push(`+${totalShield} Defense`);
      setMessage(msgs.join(' • ') || 'Match!');

      await delay(380);

      if (newEnemyHP <= 0) {
        setMessage(`${getEnemy(currentEnemyIdx, currentWave).name} defeated!`);
        await delay(700);
        await advanceEnemy(currentWave, currentEnemyIdx);
        return;
      }

      const newBoard = dropAndRefill(markedBoard);
      setBoard(newBoard);

      await delay(280);

      await runGameLoop(
        newBoard,
        newPHP,
        newPMana,
        newDef,
        newEnemyHP,
        currentWave,
        currentEnemyIdx,
        newCombo,
        false
      );
    },
    [addFloat, advanceEnemy]
  );

  const handleTilePress = useCallback(
    (pos: Position) => {
      if (isProcessing || phase !== 'playing') return;

      if (!selectedPos) {
        setSelectedPos(pos);
        return;
      }

      if (selectedPos.row === pos.row && selectedPos.col === pos.col) {
        setSelectedPos(null);
        return;
      }

      if (!isAdjacent(selectedPos, pos)) {
        setSelectedPos(pos);
        return;
      }

      const swapped = swapTiles(board, selectedPos, pos);
      const matches = findMatches(swapped);

      if (matches.size === 0) {
        setSelectedPos(null);
        setMessage('No match — try again!');
        return;
      }

      setSelectedPos(null);
      setIsProcessing(true);
      setBoard(swapped);

      const snap = {
        board: swapped,
        playerHP,
        playerMana,
        defense,
        enemyHP: enemy.hp,
        wave,
        enemyIndex,
        combo: 0,
        critActive,
      };

      setCritActive(false);

      runGameLoop(
        snap.board,
        snap.playerHP,
        snap.playerMana,
        snap.defense,
        snap.enemyHP,
        snap.wave,
        snap.enemyIndex,
        snap.combo,
        snap.critActive
      );
    },
    [
      isProcessing,
      phase,
      selectedPos,
      board,
      playerHP,
      playerMana,
      defense,
      enemy.hp,
      wave,
      enemyIndex,
      combo,
      critActive,
      runGameLoop,
    ]
  );

  const useSkillHeal = useCallback(() => {
    if (playerMana < 30 || isProcessing || phase !== 'playing') return;
    setPlayerMana(prev => prev - 30);
    setPlayerHP(prev => Math.min(PLAYER_MAX_HP, prev + 30));
    addFloat('+30 HP', '#ff88bb', 0.15, 0.8);
    setMessage('Used Heal — restored 30 HP!');
  }, [playerMana, isProcessing, phase, addFloat]);

  const useSkillCritStrike = useCallback(() => {
    if (playerMana < 40 || isProcessing || phase !== 'playing') return;
    setPlayerMana(prev => prev - 40);
    setCritActive(true);
    setMessage('Critical Strike ready — next match is CRITICAL!');
  }, [playerMana, isProcessing, phase]);

  const restartGame = useCallback(() => {
    setBoard(createInitialBoard());
    setPlayerHP(PLAYER_MAX_HP);
    setPlayerMana(20);
    setDefense(0);
    setCritActive(false);
    setWave(1);
    setEnemyIndex(0);
    setEnemy(buildEnemy(0, 1));
    setCombo(0);
    setPhase('playing');
    setSelectedPos(null);
    setIsProcessing(false);
    setMessage('The battle begins...');
    setFloatMsgs([]);
    setPlayerAttacked(false);
  }, []);

  return {
    board,
    playerHP,
    playerMana,
    defense,
    critActive,
    wave,
    enemyIndex,
    enemy,
    combo,
    phase,
    selectedPos,
    isProcessing,
    message,
    floatMsgs,
    playerAttacked,
    handleTilePress,
    useSkillHeal,
    useSkillCritStrike,
    restartGame,
  };
}
