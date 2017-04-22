import expressValidation from 'express-validation'

const ErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || 500
  if (err.isBoom) statusCode = err.output.statusCode

  let data = { status: err.status, message: err.message, code: err.code }

  // Validation Errors
  if (err instanceof expressValidation.ValidationError) {
    let validationErrors = {}
    err.errors.forEach((error) => {
      validationErrors[error.field] = error.messages[0]
    })

    data.errors = validationErrors
  }

  res.status(statusCode).json(data)
}

export default ErrorHandler
