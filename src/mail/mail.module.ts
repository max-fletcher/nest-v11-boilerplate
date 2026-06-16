/* eslint-disable */ // nodemailer has known incomplete type definitions and open type issues
import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { MailService } from './mail.service'
import { MAIL_QUEUE } from './constants/mail.constants'
import { MailProcessor } from './processors/mail.procrssors'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow<string>('MAIL_HOST'),
          port: configService.getOrThrow<number>('MAIL_PORT'),
          secure: false,
          auth: {
            user: configService.getOrThrow<string>('MAIL_USER'),
            pass: configService.getOrThrow<string>('MAIL_PASSWORD')
          }
        },
        defaults: {
          from: configService.getOrThrow<string>('MAIL_FROM')
        }
      }),
      inject: [ConfigService]
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE // registers the mail queue
    })
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService]
})
export class MailModule {}
