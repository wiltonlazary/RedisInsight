import React, {
  ChangeEvent,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { EuiProgress, EuiText, EuiTextArea, EuiToolTip } from '@elastic/eui'

import {
  bufferToSerializedFormat,
  bufferToString,
  formattingBuffer,
  isNonUnicodeFormatter,
  isEqualBuffers,
  isFormatEditable,
  stringToBuffer,
  stringToSerializedBufferFormat,
} from 'uiSrc/utils'
import {
  resetStringValue,
  setIsStringCompressed,
  stringDataSelector,
  stringSelector,
  updateStringValueAction,
} from 'uiSrc/slices/browser/string'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { AddStringFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import { selectedKeyDataSelector, selectedKeySelector } from 'uiSrc/slices/browser/keys'
import { TEXT_DISABLED_COMPRESSED_VALUE, TEXT_FAILED_CONVENT_FORMATTER, TEXT_INVALID_VALUE, TEXT_UNPRINTABLE_CHARACTERS } from 'uiSrc/constants'
import { calculateTextareaLines } from 'uiSrc/utils/calculateTextareaLines'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import styles from './styles.module.scss'

const MAX_ROWS = 25
const MIN_ROWS = 4
const APPROXIMATE_WIDTH_OF_SIGN = 8.6

export interface Props {
  isEditItem: boolean;
  setIsEdit: (isEdit: boolean) => void;
}

const StringDetails = (props: Props) => {
  const { isEditItem, setIsEdit } = props

  const { compressor = null } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(stringSelector)
  const { value: initialValue } = useSelector(stringDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const [rows, setRows] = useState<number>(5)
  const [value, setValue] = useState<JSX.Element | string>('')
  const [areaValue, setAreaValue] = useState<string>('')
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [isValid, setIsValid] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isEditable, setIsEditable] = useState(true)
  const [noEditableText, setNoEditableText] = useState<string>(TEXT_DISABLED_COMPRESSED_VALUE)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)
  const viewValueRef: Ref<HTMLPreElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => () => {
    dispatch(resetStringValue())
  }, [])

  useEffect(() => {
    if (!initialValue) return

    const { value: decompressedValue, isCompressed } = decompressingBuffer(initialValue, compressor)

    const initialValueString = bufferToString(decompressedValue, viewFormat)
    const { value: formattedValue, isValid } = formattingBuffer(decompressedValue, viewFormatProp, { expanded: true })
    setAreaValue(initialValueString)

    setValue(formattedValue)
    setIsValid(isValid)
    setIsDisabled(
      !isNonUnicodeFormatter(viewFormatProp, isValid)
        && !isEqualBuffers(initialValue, stringToBuffer(initialValueString))
    )
    setIsEditable(!isCompressed && isFormatEditable(viewFormatProp))
    setNoEditableText(isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_FAILED_CONVENT_FORMATTER(viewFormat))

    dispatch(setIsStringCompressed(isCompressed))

    if (viewFormat !== viewFormatProp) {
      setViewFormat(viewFormatProp)
    }
  }, [initialValue, viewFormatProp, compressor])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current || value === null) {
      return
    }
    const calculatedRows = calculateTextareaLines(areaValue, textAreaRef.current.clientWidth, APPROXIMATE_WIDTH_OF_SIGN)

    if (calculatedRows > MAX_ROWS) {
      setRows(MAX_ROWS)
      return
    }
    if (calculatedRows < MIN_ROWS) {
      setRows(MIN_ROWS)
      return
    }
    setRows(calculatedRows)
  }, [viewValueRef, isEditItem])

  useMemo(() => {
    if (isEditItem && initialValue) {
      (document.activeElement as HTMLElement)?.blur()
      setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    }
  }, [isEditItem])

  const onApplyChanges = () => {
    const data = stringToSerializedBufferFormat(viewFormat, areaValue)
    const onSuccess = () => {
      setIsEdit(false)
      setValue(formattingBuffer(data, viewFormat, { expanded: true })?.value)
    }
    dispatch(updateStringValueAction(key, data, onSuccess))
  }

  const onDeclineChanges = useCallback(() => {
    if (!initialValue) return

    setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    setIsEdit(false)
  }, [initialValue])

  const isLoading = loading || value === null

  return (
    <div className={styles.container}>
      {isLoading && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-key-string"
        />
      )}
      {!isEditItem && (
        <EuiText
          onClick={() => isEditable && setIsEdit(true)}
          style={{ whiteSpace: 'break-spaces' }}
          data-testid="string-value"
        >
          {areaValue !== ''
            ? (isValid
              ? value
              : (
                <EuiToolTip
                  title={noEditableText}
                  className={styles.tooltip}
                  position="bottom"
                >
                  <>{value}</>
                </EuiToolTip>
              )
            )
            : (!isLoading && (<span style={{ fontStyle: 'italic' }}>Empty</span>))}
        </EuiText>
      )}
      {isEditItem && (
        <InlineItemEditor
          controlsPosition="bottom"
          placeholder="Enter Value"
          fieldName="value"
          expandable
          isLoading={false}
          isDisabled={isDisabled}
          disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
          onDecline={onDeclineChanges}
          onApply={onApplyChanges}
          declineOnUnmount={false}
          approveText={TEXT_INVALID_VALUE}
          approveByValidation={() =>
            formattingBuffer(
              stringToSerializedBufferFormat(viewFormat, areaValue),
              viewFormat
            )?.isValid}
        >
          <EuiTextArea
            fullWidth
            name="value"
            id="value"
            rows={rows}
            resize="vertical"
            placeholder={config.value.placeholder}
            value={areaValue}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setAreaValue(e.target.value)
            }}
            disabled={loading}
            inputRef={textAreaRef}
            className={cx(styles.stringTextArea, { [styles.areaWarning]: isDisabled })}
            data-testid="string-value"
          />
        </InlineItemEditor>
      )}
    </div>
  )
}

export default StringDetails
