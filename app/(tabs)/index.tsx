import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Tile } from '../../components/game/Tile';
import { EnemyPanel } from '../../components/game/EnemyPanel';
import { PlayerPanel } from '../../components/game/PlayerPanel';
import { SkillPanel } from '../../components/game/SkillPanel';
import { GameOverScreen } from '../../components/game/GameOverScreen';
import { FloatingText } from '../../components/game/FloatingText';
import { MessageBanner } from '../../components/game/MessageBanner';
import { GRID_SIZE, TILE_CONFIG } from '../../constants/gameData';

const SKILL_PANEL_WIDTH = 70;
const H_PAD = 12;
const GRID_GAP = 2;
const LEGEND_HEIGHT = 18;

export default function GameScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const availableGridWidth = width - H_PAD * 2 - SKILL_PANEL_WIDTH - 8;
  const tileSize = Math.floor((availableGridWidth - GRID_GAP * (GRID_SIZE - 1)) / GRID_SIZE);

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
    handleTilePress,
    useSkillHeal,
    useSkillCritStrike,
    restartGame,
  } = game;

  const gridWidth = tileSize * GRID_SIZE + GRID_GAP * (GRID_SIZE - 1);
  const gridHeight = tileSize * GRID_SIZE + GRID_GAP * (GRID_SIZE - 1);
  const totalWidth = gridWidth + 8 + SKILL_PANEL_WIDTH;

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: topInset + 6,
          paddingBottom: bottomInset + 4,
          paddingHorizontal: H_PAD,
        },
      ]}
    >
      <View style={[styles.content, { maxWidth: totalWidth + H_PAD * 2, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.titleRow}>
          <Text style={styles.gameTitle}>DARK REALM</Text>
          <Text style={styles.gameSubtitle}>Match-3 Dungeon</Text>
        </View>

        <EnemyPanel enemy={enemy} wave={wave} enemyIndex={enemyIndex} />

        <MessageBanner message={message} />

        <View style={styles.middleRow}>
          <View>
            <View style={[styles.legend, { width: gridWidth }]}>
              {(['sword', 'heart', 'shield', 'star', 'moon', 'diamond'] as const).map(type => {
                const cfg = TILE_CONFIG[type];
                return (
                  <View key={type} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: cfg.iconColor }]} />
                    <Text style={[styles.legendText, { color: cfg.iconColor }]}>{cfg.label}</Text>
                  </View>
                );
              })}
            </View>

            <View
              style={[
                styles.gridContainer,
                { width: gridWidth, height: gridHeight },
              ]}
            >
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
                      selected={
                        selectedPos?.row === rowIdx && selectedPos?.col === colIdx
                      }
                      matched={tile.matched}
                      isNew={tile.isNew}
                      size={tileSize}
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
                  containerWidth={gridWidth}
                  containerHeight={gridHeight}
                />
              ))}
            </View>
          </View>

          <SkillPanel
            playerMana={playerMana}
            isProcessing={isProcessing}
            critActive={critActive}
            onHeal={useSkillHeal}
            onCritStrike={useSkillCritStrike}
          />
        </View>

        <PlayerPanel
          playerHP={playerHP}
          playerMana={playerMana}
          defense={defense}
          combo={combo}
          isProcessing={isProcessing}
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
    backgroundColor: '#080c12',
  },
  content: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  gameTitle: {
    color: '#d4af37',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 5,
    textShadowColor: '#d4af3766',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gameSubtitle: {
    color: '#8b6914',
    fontSize: 10,
    letterSpacing: 3,
    marginTop: -2,
  },
  middleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 4,
    height: LEGEND_HEIGHT,
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legendText: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  gridContainer: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#8b6914',
    borderRadius: 8,
    backgroundColor: '#0a0e1a',
  },
});
