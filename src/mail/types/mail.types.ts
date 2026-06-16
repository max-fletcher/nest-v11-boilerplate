export type TWelcomeMailJob = {
  name: string
  email: string
}

// #TODO: later
// export type TPasswordResetMailJob = {
//   email: string
//   resetLink: string
// }

// #TODO: later
// export type TVerificationMailJob = {
//   email: string
//   verificationLink: string
// }

export type TNotificationMailJob = {
  email: string
  subject: string
  message: string
}
