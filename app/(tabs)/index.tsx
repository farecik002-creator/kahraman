import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Tile } from '../../components/game/Tile';
import { EnemyPanel } from '../../components/game/EnemyPanel';
import { PlayerStats } from '../../components/game/PlayerStats';
import { SkillButtons } from '../../components/game/SkillButtons';
import { CharacterPanel } from '../../components/game/CharacterPanel';
import { GameOverScreen } from '../../components/game/GameOverScreen';
import { FloatingText } from '../../components/game/FloatingText';
import { MessageBanner } from '../../components/game/MessageBanner';
import { ParticleSystem } from '../../components/game/ParticleSystem';
import { GRID_SIZE } from '../../constants/gameData';

const GRID_GAP = 2;
const H_PAD = 8;

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const charWidth = Math.floor((width - H_PAD * 2) * 0.38);
  const boardColumnWidth = width - H_PAD * 2 - charWidth - 8;
  const tileSize = Math.floor((boardColumnWidth - GRID_GAP * (GRID_SIZE - 1)) / GRID_SIZE);
  const gridPx = tileSize * GRID_SIZE + GRID_GAP * (GRID_SIZE - 1);

  const ENEMY_H = 80;
  const MSG_H = 30;
  const STATS_H = 68;
  const TITLE_H = 36;
  const SKILLS_H = 62;
  const GAP_TOTAL = 8 * 5;
  const charHeight = height - topInset - bottomInset - TITLE_H - ENEMY_H - MSG_H - STATS_H - GAP_TOTAL;

  const game = useGameLogic();
  const {
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
    lastSkillUsed,
    handleTilePress,
    useSkillHeal,
    useSkillCritStrike,
    restartGame,
  } = game;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#040710', '#060b14', '#080e1a', '#040710']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['#1a040400', '#00000000', '#1a040400']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ParticleSystem width={width} height={height} />

      <View style={[styles.content, { paddingTop: topInset, paddingBottom: bottomInset }]}>
        <View style={styles.titleRow}>
          <View style={styles.titleDecorL} />
          <Text style={styles.gameTitle}>DARK REALM</Text>
          <View style={styles.titleDecorR} />
        </View>

        <View style={{ paddingHorizontal: H_PAD }}>
          <EnemyPanel enemy={enemy} wave={wave} enemyIndex={enemyIndex} />
        </View>

        <View style={{ paddingHorizontal: H_PAD }}>
          <MessageBanner message={message} />
        </View>

        <View style={[styles.middleRow, { paddingHorizontal: H_PAD }]}>
          <View style={[styles.boardColumn, { width: boardColumnWidth }]}>
            <View style={[styles.gridContainer, { width: gridPx, height: gridPx }]}>
              {board.map((row, rowIdx) =>
                row.map((tile, colIdx) => (
                  <View
                    key={tile.id}
                    style={{
                      position: 'absolute',
                      left: colIdx * (tileSize + GRID_GAP),
                      top: rowIdx * (tileSize + GRID_GAP),
                    }}
                  >
                    <Tile
                      type={tile.type}
                      selected={selectedPos?.row === rowIdx && selectedPos?.col === colIdx}
                      matched={tile.matched}
                      isNew={tile.isNew}
                      size={tileSize}
                      row={rowIdx}
                      col={colIdx}
                      critActive={critActive}
                      onPress={() => handleTilePress({ row: rowIdx, col: colIdx })}
                    />
                  </View>
                ))
              )}

              {floatMsgs.map(fm => (
                <FloatingText
                  key={fm.id}
                  text={fm.text}
                  color={fm.color}
                  x={fm.x}
                  y={fm.y}
                  containerWidth={gridPx}
                  containerHeight={gridPx}
                />
              ))}
            </View>

            <View style={{ height: 8 }} />

            <SkillButtons
              playerMana={playerMana}
              isProcessing={isProcessing}
              critActive={critActive}
              onHeal={useSkillHeal}
              onCritStrike={useSkillCritStrike}
            />
          </View>

          <CharacterPanel
            combo={combo}
            lastSkillUsed={lastSkillUsed}
            width={charWidth}
            height={charHeight}
          />
        </View>

        <PlayerStats
          playerHP={playerHP}
          playerMana={playerMana}
          defense={defense}
          critActive={critActive}
          playerAttacked={playerAttacked}
        />
      </View>

      {phase === 'gameOver' && (
        <GameOverScreen
          onRestart={restartGame}
          wave={wave}
          enemyIndex={enemyIndex}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#040710',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
    height: 36,
  },
  titleDecorL: {
    flex: 1,
    height: 1,
    backgroundColor: '#8b6914',
    opacity: 0.6,
  },
  titleDecorR: {
    flex: 1,
    height: 1,
    backgroundColor: '#8b6914',
    opacity: 0.6,
  },
  gameTitle: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 6,
    ...(Platform.OS === 'web'
      ? { textShadow: '0 0 12px #d4af3788' }
      : {
          textShadowColor: '#d4af3766',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 12,
        }),
  },
  middleRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  boardColumn: {
    alignItems: 'flex-start',
  },
  gridContainer: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#3a2a08',
    borderRadius: 10,
    backgroundColor: '#030508',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 20px #d4af3722, inset 0 0 30px #00000088' }
      : {
          shadowColor: '#d4af37',
          shadowRadius: 8,
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 0 },
        }),
  },
});
