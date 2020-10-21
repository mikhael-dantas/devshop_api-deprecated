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
