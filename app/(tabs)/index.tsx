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
  const STATS_H = 76; // Slightly increased for padding
  const TITLE_H = 36;
  const SKILLS_H = 68;
  const GAP_TOTAL = 18 * 5; // Final adjustment for alignment
  const charHeight = height - topInset - bottomInset - TITLE_H - ENEMY_H - MSG_H - STATS_H - GAP_TOTAL;
  // Grid height will now be controlled by charHeight to match CharacterPanel
  const gridHeight = charHeight; 

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
        colors={['#020408', '#050810', '#0a1018', '#020408']}
        locations={[0, 0.4, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Cinematic Vignette */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Warm Magic Light Source */}
      <View style={styles.lightSource} pointerEvents="none" />

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
            <View style={[styles.gridContainer, { width: gridPx, height: gridHeight }]}>
              <View style={[styles.gridInner, { height: gridHeight }]}>
                {board.map((row, rowIdx) =>
                  row.map((tile, colIdx) => (
                    <View
                      key={tile.id}
                      style={{
                        position: 'absolute',
                        left: colIdx * (tileSize + GRID_GAP),
                        top: rowIdx * ((gridHeight - (GRID_SIZE - 1) * GRID_GAP) / GRID_SIZE + GRID_GAP),
                      }}
                    >
                      <Tile
                        type={tile.type}
                        selected={selectedPos?.row === rowIdx && selectedPos?.col === colIdx}
                        matched={tile.matched}
                        isNew={tile.isNew}
                        size={tileSize}
                        tileHeight={(gridHeight - (GRID_SIZE - 1) * GRID_GAP) / GRID_SIZE}
                        row={rowIdx}
                        col={colIdx}
                        critActive={critActive}
                        onPress={() => handleTilePress({ row: rowIdx, col: colIdx })}
                      />
                    </View>
                  ))
                )}
              </View>

              {floatMsgs.map(fm => (
                <FloatingText
                  key={fm.id}
                  text={fm.text}
                  color={fm.color}
                  x={fm.x}
                  y={fm.y}
                  containerWidth={gridPx}
                  containerHeight={gridHeight}
                />
              ))}
            </View>

            <View style={{ height: 12 }} />

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
    color: '#ffcc33',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 8,
    textTransform: 'uppercase',
    ...(Platform.OS === 'web'
      ? { textShadow: '0 0 15px rgba(255, 204, 51, 0.6)' }
      : {
          textShadowColor: 'rgba(255, 204, 51, 0.6)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 15,
        }),
  },
  middleRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  boardColumn: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gridContainer: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#8b6914',
    borderRadius: 16,
    backgroundColor: '#030508',
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 40px rgba(255, 204, 51, 0.15), inset 0 0 60px #000000' }
      : {
          shadowColor: '#ffcc33',
          shadowRadius: 20,
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 0 },
        }),
  },
  gridInner: {
    width: '100%',
  },
  lightSource: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 204, 51, 0.05)',
    ...(Platform.OS === 'web' ? { filter: 'blur(80px)' } : {}),
  },
});
