import React from 'react'
import { CodeButtonParams } from 'uiSrc/pages/workbench/components/enablement-area/interfaces'
import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { RunQueryMode, ResultsMode } from 'uiSrc/slices/interfaces/workbench'
import WBResults from './WBResults'

export interface Props {
  items: CommandExecutionUI[]
  activeMode: RunQueryMode
  activeResultsMode: ResultsMode
  scrollDivRef: React.Ref<HTMLDivElement>
  onQueryReRun: (query: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
  onQueryOpen: (commandId: string) => void
  onQueryDelete: (commandId: string) => void
  onQueryProfile: (query: string, commandId?: Nullable<string>, executeParams?: CodeButtonParams) => void
}

const WBResultsWrapper = (props: Props) => (
  <WBResults {...props} />
)

export default React.memo(WBResultsWrapper)
