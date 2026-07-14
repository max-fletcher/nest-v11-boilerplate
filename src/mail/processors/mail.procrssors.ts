// nodemailer has known incomplete type definitions and open type issues
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { MailerService } from '@nestjs-modules/mailer'
import { CustomLoggerService } from 'src/custom-logger/custom-logger.service'
import { MAIL_JOBS, MAIL_QUEUE } from '../constants/mail.constants'
import { TNotificationMailJob, TWelcomeMailJob } from '../types/mail.types'

@Processor(MAIL_QUEUE)
export class MailProcessor extends WorkerHost {
  private readonly logger = new CustomLoggerService(MailProcessor.name)

  constructor(private readonly mailerService: MailerService) {
    super()
  }

  // routes jobs to the correct handler based on job name
  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job ${job.name} with id ${job.id}`, MailProcessor.name)

    switch (job.name) {
      case MAIL_JOBS.WELCOME:
        await this.handleWelcomeEmail(job as Job<TWelcomeMailJob>)
        break
      // #TODO: later
      // case MAIL_JOBS.PASSWORD_RESET:
      // await this.handlePasswordResetEmail(job as Job<TPasswordResetMailJob>)
      // break
      // case MAIL_JOBS.VERIFICATION:
      //     await this.handleVerificationEmail(job as Job<TVerificationMailJob>)
      //     break
      case MAIL_JOBS.NOTIFICATION:
        await this.handleNotificationEmail(job as Job<TNotificationMailJob>)
        break
      default:
        this.logger.error(`Unknown job name: ${job.name}`, MailProcessor.name)
    }
  }

  private async handleWelcomeEmail(job: Job<TWelcomeMailJob>) {
    const { name, email } = job.data
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thanks for joining us.</p>
      `
    })
    this.logger.log(`Welcome email sent to ${email}`, MailProcessor.name)
  }

  // #TODO: later
  // private async handlePasswordResetEmail(job: Job<TPasswordResetMailJob>) {
  // const { email, resetLink } = job.data
  // await this.mailerService.sendMail({
  //     to: email,
  //     subject: 'Password Reset',
  //     html: `
  //     <h1>Password Reset</h1>
  //     <p>Click the link below to reset your password:</p>
  //     <a href="${resetLink}">Reset Password</a>
  //     <p>This link expires in 1 hour.</p>
  //     `
  // })
  // this.logger.log(`Password reset email sent to ${email}`, MailProcessor.name)
  // }

  // private async handleVerificationEmail(job: Job<TVerificationMailJob>) {
  // const { email, verificationLink } = job.data
  // await this.mailerService.sendMail({
  //     to: email,
  //     subject: 'Verify your email',
  //     html: `
  //     <h1>Email Verification</h1>
  //     <p>Click the link below to verify your email:</p>
  //     <a href="${verificationLink}">Verify Email</a>
  //     `
  // })
  // this.logger.log(`Verification email sent to ${email}`, MailProcessor.name)
  // }

  private async handleNotificationEmail(job: Job<TNotificationMailJob>) {
    const { email, subject, message } = job.data
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: `<p>${message}</p>`
    })
    this.logger.log(`Notification email sent to ${email}`, MailProcessor.name)
  }
}
