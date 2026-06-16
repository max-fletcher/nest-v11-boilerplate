import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { MAIL_JOBS, MAIL_QUEUE } from './constants/mail.constants'
import { TNotificationMailJob, TWelcomeMailJob } from './types/mail.types'

@Injectable()
export class MailService {
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  // adds jobs to the queue — returns immediately, doesn't wait for email to send
  async sendWelcomeEmail(data: TWelcomeMailJob) {
    await this.mailQueue.add(MAIL_JOBS.WELCOME, data, {
      attempts: 3, // retry 3 times if it fails
      backoff: {
        type: 'exponential',
        delay: 5000 // wait 5s, then 10s, then 20s between retries
      }
    })
  }

  // #TODO: later
  // async sendPasswordResetEmail(data: TPasswordResetMailJob) {
  //     await this.mailQueue.add(MAIL_JOBS.PASSWORD_RESET, data, {
  //     attempts: 3,
  //     backoff: { type: 'exponential', delay: 5000 }
  //     })
  // }

  // #TODO: later
  // async sendVerificationEmail(data: TVerificationMailJob) {
  // await this.mailQueue.add(MAIL_JOBS.VERIFICATION, data, {
  //     attempts: 3,
  //     backoff: { type: 'exponential', delay: 5000 }
  // })
  // }

  async sendNotificationEmail(data: TNotificationMailJob) {
    await this.mailQueue.add(MAIL_JOBS.NOTIFICATION, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })
  }
}
