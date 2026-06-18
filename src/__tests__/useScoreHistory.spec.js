import { describe, it, expect, beforeEach } from 'vitest'
import { useScoreHistory } from '../composables/useScoreHistory.js'

describe('useScoreHistory', () => {
  beforeEach(() => {
    useScoreHistory().history.value = []
  })

  it('records an entry with the given score, levelIndex and won flag', () => {
    const { history, recordScore } = useScoreHistory()
    recordScore({ score: 50, levelIndex: 2, won: true })
    expect(history.value).toHaveLength(1)
    expect(history.value[0]).toMatchObject({ score: 50, levelIndex: 2, won: true })
    expect(typeof history.value[0].timestamp).toBe('number')
  })

  it('keeps every recorded entry in history, uncapped', () => {
    const { history, recordScore } = useScoreHistory()
    for (let i = 0; i < 15; i++) recordScore({ score: i, levelIndex: 0, won: false })
    expect(history.value).toHaveLength(15)
  })

  it('sorts topScores descending by score', () => {
    const { recordScore, topScores } = useScoreHistory()
    recordScore({ score: 10, levelIndex: 0, won: true })
    recordScore({ score: 90, levelIndex: 1, won: true })
    recordScore({ score: 50, levelIndex: 2, won: false })
    expect(topScores.value.map((e) => e.score)).toEqual([90, 50, 10])
  })

  it('caps topScores to the first 10 entries', () => {
    const { recordScore, topScores } = useScoreHistory()
    for (let i = 0; i < 15; i++) recordScore({ score: i, levelIndex: 0, won: false })
    expect(topScores.value).toHaveLength(10)
    expect(topScores.value[0].score).toBe(14)
  })
})
