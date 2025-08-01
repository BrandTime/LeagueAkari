import { Dep, IAkariShardInitDispose, Shard } from '@shared/akari-shard'
import { RadixEventEmitter } from '@shared/event-emitter'
import { LcuEvent } from '@shared/types/league-client/event'
import { watch } from 'vue'

import { AkariIpcRenderer } from '../ipc'
import { LoggerRenderer } from '../logger'
import { PiniaMobxUtilsRenderer } from '../pinia-mobx-utils'
import { SettingUtilsRenderer } from '../setting-utils'
import { SetupInAppScopeRenderer } from '../setup-in-app-scope'
import { useRendererDebugStore } from './store'

const MAIN_SHARD_NAMESPACE = 'renderer-debug-main'

@Shard(RendererDebugRenderer.id)
export class RendererDebugRenderer implements IAkariShardInitDispose {
  static id = 'renderer-debug-renderer'

  private readonly _matcher = new RadixEventEmitter()

  constructor(
    @Dep(AkariIpcRenderer) private readonly _ipc: AkariIpcRenderer,
    @Dep(PiniaMobxUtilsRenderer) private readonly _pm: PiniaMobxUtilsRenderer,
    @Dep(LoggerRenderer) private readonly _log: LoggerRenderer,
    @Dep(SettingUtilsRenderer) private readonly _setting: SettingUtilsRenderer,
    @Dep(SetupInAppScopeRenderer) private readonly _setupInAppScope: SetupInAppScopeRenderer
  ) {}

  async onInit() {
    const store = useRendererDebugStore()

    await this._pm.sync(MAIN_SHARD_NAMESPACE, 'state', store)

    const savedRules = await this._setting.get(RendererDebugRenderer.id, 'savedRules')

    if (savedRules) {
      for (const rule of savedRules) {
        this.addRule(rule, false)
      }
    }

    this._ipc.onEvent(MAIN_SHARD_NAMESPACE, 'lc-event', (data: LcuEvent) => {
      this._matcher.emit(data.uri, data)
    })

    this._setupInAppScope.addSetupFn(() => {
      watch(
        () => store.rules.filter((r) => r.enabled).length,
        (length) => {
          if (length) {
            this._log.info(RendererDebugRenderer.id, 'send all native lcu events')
            this.setSendAllNativeLcuEvents(true)
          } else {
            this._log.info(RendererDebugRenderer.id, 'do not send all native lcu events')
            this.setSendAllNativeLcuEvents(false)
          }
        },
        { immediate: true }
      )
    })

    this._setupInAppScope.addSetupFn(() => {
      watch(
        () => store.rules.map((r) => r.rule),
        (rules) => {
          this._setting.set(RendererDebugRenderer.id, 'savedRules', rules)
        }
      )
    })
  }

  private _sanitizeRule(rule: string) {
    return rule
      .replace(/\/+$/, '') // 去除结尾的斜杠
      .replace(/^([^/])/, '/$1') // 补足前面的斜杠
      .replace(/\/{2,}/g, '/')
  }

  addRule(rule: string, enabled = true) {
    const store = useRendererDebugStore()

    if (store.rules.some((r) => r.rule === rule)) {
      return
    }

    rule = this._sanitizeRule(rule)

    let stopFn: (() => void) | null = null
    if (enabled) {
      stopFn = this._matcher.on(rule, (data) => {
        if (store.logAllLcuEvents) {
          this._log.info(data.uri, data.eventType, data.data)
        } else {
          this._log.infoRenderer(data.uri, data.eventType, data.data)
        }
      })
    }

    store.rules.push({ rule, stopFn, enabled })
  }

  enableRule(rule: string) {
    const store = useRendererDebugStore()

    const ruleO = store.rules.find((r) => r.rule === rule)

    if (!ruleO) {
      return
    }

    ruleO.stopFn?.()
    ruleO.enabled = true

    const stopFn = this._matcher.on(rule, (data) => {
      if (store.logAllLcuEvents) {
        this._log.info(data.uri, data.eventType, data.data)
      } else {
        this._log.infoRenderer(data.uri, data.eventType, data.data)
      }
    })

    ruleO.stopFn = stopFn
  }

  disableRule(rule: string) {
    const store = useRendererDebugStore()

    const ruleO = store.rules.find((r) => r.rule === rule)

    if (!ruleO) {
      return
    }

    ruleO.enabled = false
    ruleO.stopFn?.()
    ruleO.stopFn = null
  }

  removeRule(rule: string) {
    const store = useRendererDebugStore()

    const i = store.rules.findIndex((r) => r.rule === rule)

    if (i === -1) {
      return
    }

    store.rules[i].stopFn?.()
    store.rules.splice(i, 1)
  }

  async onDispose() {}

  setSendAllNativeLcuEvents(value: boolean) {
    return this._ipc.call(MAIN_SHARD_NAMESPACE, 'setSendAllNativeLcuEvents', value)
  }

  setLogAllLcuEvents(value: boolean) {
    return this._ipc.call(MAIN_SHARD_NAMESPACE, 'setLogAllLcuEvents', value)
  }
}
