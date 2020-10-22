import { validator } from '@ioc:Adonis/Core/Validator'

validator.rule('integer', (value, _, { pointer, arrayExpressionPointer, errorReporter }) => {
  /**
   * Skip validation when value is not a string. The string
   * schema rule will handle it
   */
  if (typeof (value) !== 'string' && typeof (value) !== 'number') {
    return
  }

  /**
   * Report error when phone number is not valid
   */
  if (!Number.isInteger(value)) {
    errorReporter.report(pointer, 'integer', 'Invalid integer', arrayExpressionPointer)
  }
})

validator.rule('stringsOrNumbersObject', (value, _, { pointer, arrayExpressionPointer, errorReporter }) => {
  if (typeof (value) !== 'object') {
    return
  }

  let invalidCount = 0
  Object.values(value).forEach(objectValue => {
    if (!['number', 'string'].includes(typeof objectValue)) {
      invalidCount += 1
    }
  })

  if (invalidCount > 0) {
    errorReporter.report(pointer, 'stringsOrNumbersObject', 'Invalid stringsOrNumbersObject', arrayExpressionPointer)
  }
})
