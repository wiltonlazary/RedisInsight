import React from 'react'
import { ToggleButton as RedisUiToggleButton } from '@redis-ui/components'

export type ButtonProps = React.ComponentProps<typeof RedisUiToggleButton>

export const ToggleButton = ({ ...props }: ButtonProps) => {
  return <RedisUiToggleButton {...props} />
}
