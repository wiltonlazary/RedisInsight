import React, { ChangeEvent } from 'react'
import {
  EuiCheckbox,
  EuiFieldNumber,
  EuiFieldPassword,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiRadioGroup,
  EuiRadioGroupOption,
  EuiTextArea,
  htmlIdGenerator
} from '@elastic/eui'
import cx from 'classnames'
import { FormikProps } from 'formik'

import {
  MAX_PORT_NUMBER,
  selectOnFocus,
  validateField,
  validatePortNumber
} from 'uiSrc/utils'

import { SshPassType } from '../constants'
import { DbConnectionInfo } from '../interfaces'

import styles from '../styles.module.scss'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const sshPassTypeOptions: EuiRadioGroupOption[] = [
  { id: SshPassType.Password, label: 'Password', 'data-test-subj': 'radio-btn-password' },
  { id: SshPassType.PrivateKey, label: 'Private Key', 'data-test-subj': 'radio-btn-privateKey' }
]

const SSHDetails = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props

  return (
    <>
      <EuiFlexGroup
        className={cx(flexGroupClassName, {
          [styles.tlsContainer]: !flexGroupClassName,
          [styles.tlsSniOpened]: !!formik.values.ssh
        })}
        alignItems={!flexGroupClassName ? 'flexEnd' : undefined}
        responsive={false}
      >
        <EuiFlexItem
          style={{ width: '230px' }}
          grow={false}
          className={flexItemClassName}
        >
          <EuiCheckbox
            id={`${htmlIdGenerator()()} ssh`}
            name="ssh"
            label="Use SSH Tunnel"
            checked={!!formik.values.ssh}
            onChange={formik.handleChange}
            data-testid="use-ssh"
          />
        </EuiFlexItem>
      </EuiFlexGroup>

      {formik.values.ssh && (
      <>
        <EuiFlexGroup
          className={flexGroupClassName}
        >
          <EuiFlexItem className={cx(flexItemClassName)}>
            <EuiFormRow label="Host*">
              <EuiFieldText
                name="sshHost"
                id="sshHost"
                data-testid="sshHost"
                color="secondary"
                maxLength={200}
                placeholder="Enter SSH Host"
                value={formik.values.sshHost ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim())
                  )
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem className={flexItemClassName}>
            <EuiFormRow label="Port*" helpText="Should not exceed 65535.">
              <EuiFieldNumber
                name="sshPort"
                id="sshPort"
                data-testid="sshPort"
                style={{ width: '100%' }}
                placeholder="Enter SSH Port"
                value={formik.values.sshPort ?? ''}
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
        </EuiFlexGroup>

        <EuiFlexGroup
          className={flexGroupClassName}
        >
          <EuiFlexItem className={cx(flexItemClassName)}>
            <EuiFormRow label="Username*">
              <EuiFieldText
                name="sshUsername"
                id="sshUsername"
                data-testid="sshUsername"
                color="secondary"
                maxLength={200}
                placeholder="Enter SSH Username"
                value={formik.values.sshUsername ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  formik.setFieldValue(
                    e.target.name,
                    validateField(e.target.value.trim())
                  )
                }}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiFlexGroup
          className={flexGroupClassName}
        >
          <EuiFlexItem className={cx(flexItemClassName, styles.sshPassTypeWrapper)}>
            <EuiRadioGroup
              id="sshPassType"
              name="sshPassType"
              options={sshPassTypeOptions}
              idSelected={formik.values.sshPassType}
              className={styles.sshPassType}
              onChange={(id) => formik.setFieldValue('sshPassType', id)}
              data-testid="ssh-pass-type"
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        {formik.values.sshPassType === SshPassType.Password && (
          <EuiFlexGroup
            className={flexGroupClassName}
          >
            <EuiFlexItem className={flexItemClassName}>
              <EuiFormRow label="Password">
                <EuiFieldPassword
                  type="dual"
                  name="sshPassword"
                  id="sshPassword"
                  data-testid="sshPassword"
                  fullWidth
                  className="passwordField"
                  maxLength={10_000}
                  placeholder="Enter SSH Password"
                  value={formik.values.sshPassword ?? ''}
                  onChange={formik.handleChange}
                  dualToggleProps={{ color: 'text' }}
                  autoComplete="new-password"
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}

        {formik.values.sshPassType === SshPassType.PrivateKey && (
        <>
          <EuiFlexGroup
            className={flexGroupClassName}
          >
            <EuiFlexItem className={flexItemClassName}>
              <EuiFormRow label="Private Key*">
                <EuiTextArea
                  name="sshPrivateKey"
                  id="sshPrivateKey"
                  className={styles.customScroll}
                  value={formik.values.sshPrivateKey ?? ''}
                  onChange={formik.handleChange}
                  fullWidth
                  maxLength={50_000}
                  placeholder="Enter SSH Private Key in PEM format"
                  data-testid="sshPrivateKey"
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup
            className={flexGroupClassName}
          >
            <EuiFlexItem className={flexItemClassName}>
              <EuiFormRow label="Passphrase">
                <EuiFieldPassword
                  type="dual"
                  name="sshPassphrase"
                  id="sshPassphrase"
                  data-testid="sshPassphrase"
                  fullWidth
                  className="passwordField"
                  maxLength={50_000}
                  placeholder="Enter Passphrase for Private Key"
                  value={formik.values.sshPassphrase ?? ''}
                  onChange={formik.handleChange}
                  dualToggleProps={{ color: 'text' }}
                  autoComplete="new-password"
                />
              </EuiFormRow>
            </EuiFlexItem>
          </EuiFlexGroup>
        </>
        )}
      </>
      )}
    </>
  )
}

export default SSHDetails
