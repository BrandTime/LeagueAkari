import { ChampSelectTeam } from '@shared/types/league-client/champ-select'
import { defineStore } from 'pinia'
import { shallowReactive, shallowRef } from 'vue'

// copied from main shard
interface UpcomingBanPick {
  championId: number
  isActingNow: boolean
  action: {
    id: number
    isInProgress: boolean
    completed: boolean
  }
}

export type PlaceInfo =
  | {
      place: 'bench'
    }
  | {
      place: 'player'
      puuid: string
      cellId: number
    }
  | {
      place: 'candidate-cards'
      puuid: string
      cellId: number
    }
  | {
      place: 'uncertain'
    }
  | {
      place: 'candidate-cards-or-bench'
      puuid: string
      cellId: number
    }

export interface TrackEvent {
  championId: number
  from: PlaceInfo
  to: PlaceInfo
  timestamp: number
}

export const useAutoSelectStore = defineStore('shard:auto-select-renderer', () => {
  const settings = shallowReactive({
    normalModeEnabled: false,
    expectedChampions: {
      top: [],
      jungle: [],
      middle: [],
      bottom: [],
      utility: [],
      default: []
    },
    selectTeammateIntendedChampion: false,
    showIntent: false,
    pickStrategy: 'lock-in',
    lockInDelaySeconds: 0,
    benchModeEnabled: false,
    benchSelectFirstAvailableChampion: false,
    benchHandleTradeEnabled: false,
    benchExpectedChampions: [],
    grabDelaySeconds: 1,
    banEnabled: false,
    banDelaySeconds: 0,
    bannedChampions: {
      top: [],
      jungle: [],
      middle: [],
      bottom: [],
      utility: [],
      default: []
    },
    banTeammateIntendedChampion: false
  })

  const targetPick = shallowRef<UpcomingBanPick | null>(null)
  const targetBan = shallowRef<UpcomingBanPick | null>(null)
  const memberMe = shallowRef<ChampSelectTeam | null>(null)
  const upcomingGrab = shallowRef<{ championId: number; willGrabAt: number } | null>(null)
  const upcomingPick = shallowRef<{ championId: number; willPickAt: number } | null>(null)
  const upcomingBan = shallowRef<{ championId: number; willBanAt: number } | null>(null)

  return {
    settings,

    targetPick,
    targetBan,
    upcomingGrab,
    memberMe,
    upcomingPick,
    upcomingBan
  }
})
