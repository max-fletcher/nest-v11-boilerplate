export const formattedResponse = (data: Record<string, unknown>, status: number = 200, message: string = 'Success') => {
  return {
    success: true,
    status,
    response: {
      message,
      data
    }
  }
}
