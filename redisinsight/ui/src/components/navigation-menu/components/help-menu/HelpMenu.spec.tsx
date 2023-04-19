import React from 'react'
import { cloneDeep } from 'lodash'
import { render, screen, fireEvent, mockedStore, cleanup } from 'uiSrc/utils/test-utils'
import { setOnboarding } from 'uiSrc/slices/app/features'

import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { setReleaseNotesViewed, setShortcutsFlyoutState } from 'uiSrc/slices/app/info'

import HelpMenu from './HelpMenu'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/info', () => ({
  ...jest.requireActual('uiSrc/slices/app/info'),
  appElectronInfoSelector: jest.fn().mockReturnValue({
    isReleaseNotesViewed: false
  })
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('HelpMenu', () => {
  it('should render', () => {
    expect(render(<HelpMenu />)).toBeTruthy()
  })

  it('should call proper action after click on keyboard shortcuts', () => {
    render(<HelpMenu />)

    fireEvent.click(screen.getByTestId('help-menu-button'))
    fireEvent.click(screen.getByTestId('shortcuts-btn'))

    const expectedActions = [setShortcutsFlyoutState(true)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper action after click on release notes', () => {
    render(<HelpMenu />)

    fireEvent.click(screen.getByTestId('help-menu-button'))
    fireEvent.click(screen.getByTestId('release-notes-btn'))

    const expectedActions = [setReleaseNotesViewed(true)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper action after click on reset onboarding', () => {
    render(<HelpMenu />)

    fireEvent.click(screen.getByTestId('help-menu-button'))
    fireEvent.click(screen.getByTestId('reset-onboarding-btn'))

    const expectedActions = [setOnboarding({
      currentStep: 0,
      totalSteps: Object.keys(ONBOARDING_FEATURES || {}).length
    })]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call proper telemetry after click reset onboarding', () => {
    const sendEventTelemetryMock = jest.fn();
    (sendEventTelemetry as jest.Mock).mockImplementation(() => sendEventTelemetryMock)
    render(<HelpMenu />)

    fireEvent.click(screen.getByTestId('help-menu-button'))
    fireEvent.click(screen.getByTestId('reset-onboarding-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.ONBOARDING_TOUR_TRIGGERED,
      eventData: {
        databaseId: '-',
      }
    });

    (sendEventTelemetry as jest.Mock).mockRestore()
  })
})
