<template>
  <div class="common-buttons" :class="{ blurred: mws.focus === 'blurred' }">
    <NTooltip :z-index="TITLE_BAR_TOOLTIP_Z_INDEX">
      <template #trigger>
        <div class="common-button-outer" @click="openAnnouncementModal">
          <div class="common-button-inner">
            <NIcon><NotificationIcon /></NIcon>
          </div>
        </div>
      </template>
      {{ t('CommonButtons.announcement') }}
    </NTooltip>
    <NTooltip :z-index="TITLE_BAR_TOOLTIP_Z_INDEX">
      <template #trigger>
        <div class="common-button-outer" @click="handleToGithub">
          <div class="common-button-inner">
            <NIcon><LogoGithub /></NIcon>
          </div>
        </div>
      </template>
      {{ t('CommonButtons.github') }}
    </NTooltip>
    <NTooltip :z-index="TITLE_BAR_TOOLTIP_Z_INDEX" v-if="aws.settings.enabled">
      <template #trigger>
        <div class="common-button-outer" @click="handleShowAuxWindow">
          <div class="common-button-inner">
            <NIcon><Window24FilledIcon /></NIcon>
          </div>
        </div>
      </template>
      {{ t('CommonButtons.auxWindow') }}
    </NTooltip>
    <NTooltip :z-index="TITLE_BAR_TOOLTIP_Z_INDEX" v-if="ows.settings.enabled">
      <template #trigger>
        <div class="common-button-outer" @click="handleShowOpggWindow">
          <OpggIcon class="common-button-inner common-button-inner-img" />
        </div>
      </template>
      {{ t('CommonButtons.opggWindow') }}
    </NTooltip>
  </div>
</template>

<script setup lang="ts">
import OpggIcon from '@renderer-shared/assets/icon/OpggIcon.vue'
import { useInstance } from '@renderer-shared/shards'
import { WindowManagerRenderer } from '@renderer-shared/shards/window-manager'
import {
  useAuxWindowStore,
  useMainWindowStore,
  useOpggWindowStore
} from '@renderer-shared/shards/window-manager/store'
import { LEAGUE_AKARI_GITHUB } from '@shared/constants/common'
import { Notification as NotificationIcon } from '@vicons/carbon'
import { Window24Filled as Window24FilledIcon } from '@vicons/fluent'
import { LogoGithub } from '@vicons/ionicons5'
import { useTranslation } from 'i18next-vue'
import { NIcon, NTooltip } from 'naive-ui'
import { inject } from 'vue'

const { t } = useTranslation()

const mws = useMainWindowStore()
const aws = useAuxWindowStore()
const ows = useOpggWindowStore()
const wm = useInstance(WindowManagerRenderer)

const { openAnnouncementModal } = inject('app') as any

const TITLE_BAR_TOOLTIP_Z_INDEX = 75000

const handleShowAuxWindow = () => {
  wm.auxWindow.show()
}

const handleShowOpggWindow = () => {
  wm.opggWindow.show()
}

const handleToGithub = () => {
  window.open(LEAGUE_AKARI_GITHUB, '_blank')
}
</script>

<style lang="less" scoped>
.common-buttons {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;

  &.blurred {
    filter: brightness(0.8);
  }

  .common-button-outer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 100%;
    cursor: pointer;
    -webkit-app-region: no-drag;
  }

  .common-button-inner {
    padding: 4px;
    border-radius: 2px;
    transition:
      background-color 0.3s,
      color 0.3s;
    font-size: 16px;

    i {
      display: block;
    }
  }

  .common-button-inner-img {
    width: 16px;
    height: 16px;
  }
}

[data-theme='dark'] {
  .common-buttons {
    .common-button-outer:hover .common-button-inner {
      background-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 1);
    }

    .common-button-outer:active .common-button-inner {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .common-button-inner {
      color: rgba(255, 255, 255, 0.86);
    }
  }
}

[data-theme='light'] {
  .common-buttons {
    .common-button-outer:hover .common-button-inner {
      background-color: rgba(0, 0, 0, 0.15);
      color: rgba(0, 0, 0, 1);
    }

    .common-button-outer:active .common-button-inner {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .common-button-inner {
      color: rgba(0, 0, 0, 0.86);
    }
  }
}
</style>
