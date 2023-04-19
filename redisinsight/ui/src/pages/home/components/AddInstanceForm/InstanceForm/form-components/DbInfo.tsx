import React from 'react'
import { useSelector } from 'react-redux'
import { EuiIcon, EuiListGroup, EuiListGroupItem, EuiText, EuiTextColor, EuiToolTip } from '@elastic/eui'
import { capitalize } from 'lodash'
import cx from 'classnames'
import { DatabaseListModules } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { Endpoint } from 'apiSrc/common/models'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import styles from '../styles.module.scss'

export interface Props {
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  nodes: Nullable<Endpoint[]>
  host: string
  port: string
  db: Nullable<number>
  modules: AdditionalRedisModule[]
}

const DbInfo = (props: Props) => {
  const { connectionType, nameFromProvider, nodes = null, host, port, db, modules } = props

  const { server } = useSelector(appInfoSelector)

  const AppendEndpoints = () => (
    <EuiToolTip
      title="Host:port"
      position="left"
      anchorClassName={styles.anchorEndpoints}
      content={(
        <ul className={styles.endpointsList}>
          {nodes?.map(({ host: eHost, port: ePort }) => (
            <li key={host + port}>
              <EuiText>
                {eHost}
                :
                {ePort}
                ;
              </EuiText>
            </li>
          ))}
        </ul>
      )}
    >
      <EuiIcon
        type="iInCircle"
        color="subdued"
        title=""
        style={{ cursor: 'pointer' }}
      />
    </EuiToolTip>
  )

  return (
    <EuiListGroup className={styles.dbInfoGroup} flush>
      <EuiListGroupItem
        label={(
          <EuiText color="subdued" size="s">
            Connection Type:
            <EuiTextColor color="default" className={styles.dbInfoListValue} data-testid="connection-type">
              {capitalize(connectionType)}
            </EuiTextColor>
          </EuiText>
        )}
      />

      {nameFromProvider && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Database Name from Provider:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}
      <EuiListGroupItem
        label={(
          <>
            {!!nodes?.length && <AppendEndpoints />}
            <EuiText color="subdued" size="s">
              Host:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {host}
              </EuiTextColor>
            </EuiText>
          </>
        )}
      />
      {server?.buildType === BuildType.RedisStack && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Port:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {port}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}

      {!!db && (
        <EuiListGroupItem
          label={(
            <EuiText color="subdued" size="s">
              Database Index:
              <EuiTextColor color="default" className={styles.dbInfoListValue}>
                {db}
              </EuiTextColor>
            </EuiText>
          )}
        />
      )}

      {!!modules?.length && (
        <>
          <EuiListGroupItem
            className={styles.dbInfoModulesLabel}
            label={(
              <EuiText color="subdued" size="s">
                Modules:
              </EuiText>
            )}
          />
          <EuiTextColor color="default" className={cx(styles.dbInfoListValue, styles.dbInfoModules)}>
            <DatabaseListModules modules={modules} />
          </EuiTextColor>
        </>
      )}
    </EuiListGroup>
  )
}

export default DbInfo
