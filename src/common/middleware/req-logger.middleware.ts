import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { CustomLoggerService } from 'src/custom-logger/custom-logger.service'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new CustomLoggerService(RequestLoggerMiddleware.name)

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req
    const userAgent = req.get('user-agent') ?? 'unknown'
    const start = Date.now()

    // log when response finishes
    res.on('finish', () => {
      const duration = Date.now() - start
      const statusCode = res.statusCode

      const logMessage = `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`

      // use different log levels based on status code
      if (statusCode >= 500) {
        this.logger.error(logMessage, RequestLoggerMiddleware.name)
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage, RequestLoggerMiddleware.name)
      } else {
        this.logger.log(logMessage, RequestLoggerMiddleware.name)
      }
    })

    next() // always call next() or request hangs
  }
}
