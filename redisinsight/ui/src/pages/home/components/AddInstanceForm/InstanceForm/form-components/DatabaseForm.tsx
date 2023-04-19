import React, { ChangeEvent } from 'react'
import { useSelector } from 'react-redux'
import { FormikProps } from 'formik'

import {
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow, EuiIcon,
  EuiToolTip
} from '@elastic/eui'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { handlePasteHostName, MAX_PORT_NUMBER, MAX_TIMEOUT_NUMBER, selectOnFocus, validateField, validatePortNumber, validateTimeoutNumber } from 'uiSrc/utils'
import { ConnectionType, InstanceType } from 'uiSrc/slices/interfaces'
import { DbConnectionInfo } from '../interfaces'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
  isEditMode: boolean
  isCloneMode: boolean
  onHostNamePaste: (content: string) => boolean
  instanceType: InstanceType
  connectionType?: ConnectionType
}

const DatabaseForm = (props: Props) => {
  const {
    flexGroupClassName = '',
    flexItemClassName = '',
    formik,
    isEditMode,
    isCloneMode,
    onHostNamePaste,
    instanceType,
    connectionType
  } = props

  const { server } = useSelector(appInfoSelector)

  const AppendHostName = () => (
    <EuiToolTip
      title={(
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      )}
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={(
        <ul className="homePage_toolTipUl">
          <li>
            <span className="dot" />
            redis://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            rediss://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            host:port
          </li>
        </ul>
      )}
    >
      <EuiIcon type="iInCircle" style={{ cursor: 'pointer' }} />
    </EuiToolTip>
  )

  return (
    <>
      <EuiFlexGroup className={flexGroupClassName}>
        {(!isEditMode || isCloneMode) && (
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Host*">
              <EuiFieldText
                autoFocus={!isCloneMode && isEditMode}
                name="host"
                id="host"
                data-testid="host"
                color="secondary"
                maxLength={200}
                placeholder="Enter Hostname / IP address / Connection URL"
                value={formik.values.host ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim())
                  )
                }}
                onPaste={(event: React.ClipboardEvent<HTMLInputElement>) => handlePasteHostName(onHostNamePaste, event)}
                onFocus={selectOnFocus}
                append={<AppendHostName />}
              />
            </EuiFormRow>
          </EuiFlexItem>
        )}
        {server?.buildType !== BuildType.RedisStack && (
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Port*" helpText="Should not exceed 65535.">
              <EuiFieldNumber
                name="port"
                id="port"
                data-testid="port"
                style={{ width: '100%' }}
                placeholder="Enter Port"
                value={formik.values.port ?? ''}
                maxLength={6}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validatePortNumber(e.target.value.trim())
                  )
                }}
                onFocus={selectOnFocus}
                type="text"
                min={0}
                max={MAX_PORT_NUMBER}
              />
            </EuiFormRow>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>

      {(
        (!isEditMode || isCloneMode)
        && instanceType !== InstanceType.Sentinel
        && connectionType !== ConnectionType.Sentinel
      ) && (
        <EuiFlexGroup className={flexGroupClassName}>
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Database Alias*">
              <EuiFieldText
                fullWidth
                name="name"
                id="name"
                data-testid="name"
                placeholder="Enter Database Alias"
                onFocus={selectOnFocus}
                value={formik.values.name ?? ''}
                maxLength={500}
                onChange={formik.handleChange}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
      )}

      <EuiFlexGroup className={flexGroupClassName}>
        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Username">
            <EuiFieldText
              name="username"
              id="username"
              data-testid="username"
              fullWidth
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.username ?? ''}
              onChange={formik.handleChange}
            />
          </EuiFormRow>
        </EuiFlexItem>

        <EuiFlexItem className={flexItemClassName}>
          <EuiFormRow label="Password">
            <EuiFieldPassword
              type="dual"
              name="password"
              id="password"
              data-testid="password"
              fullWidth
              className="passwordField"
              maxLength={10_000}
              placeholder="Enter Password"
              value={formik.values.password ?? ''}
              onChange={formik.handleChange}
              dualToggleProps={{ color: 'text' }}
              autoComplete="new-password"
            />
          </EuiFormRow>
        </EuiFlexItem>

        {connectionType !== ConnectionType.Sentinel && instanceType !== InstanceType.Sentinel && (
          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Timeout (s)">
              <EuiFieldNumber
                name="timeout"
                id="timeout"
                data-testid="timeout"
                style={{ width: '100%' }}
                placeholder="Enter Timeout (in seconds)"
                value={formik.values.timeout ?? ''}
                maxLength={7}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateTimeoutNumber(e.target.value.trim())
                  )
                }}
                onFocus={selectOnFocus}
                type="text"
                min={1}
                max={MAX_TIMEOUT_NUMBER}
              />
            </EuiFormRow>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
    </>
  )
}

export default DatabaseForm
