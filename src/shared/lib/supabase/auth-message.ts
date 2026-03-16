const AUTH_MESSAGE_MAP: Array<[string, string]> = [
  ["invalid login credentials", "邮箱或密码不正确。"],
  ["email not confirmed", "请先完成邮箱验证，再回来登录。"],
  ["user already registered", "这个邮箱已经注册过了，可以直接登录或重设密码。"],
  ["password should be at least", "密码长度太短了，请换一个更长的密码。"],
  ["new password should be different from the old password", "新密码需要和旧密码不同。"],
  ["auth session missing", "登录状态已经失效，请重新登录后再试。"],
  ["email rate limit exceeded", "邮件发送太频繁了，请稍后再试。"],
  ["for security purposes, you can only request this after", "请求太频繁了，请稍后再试。"],
];

export function toAuthMessage(message: string | null | undefined) {
  if (!message) {
    return "认证请求没有完成，请稍后再试。";
  }

  const normalized = message.toLowerCase();
  const mapped = AUTH_MESSAGE_MAP.find(([pattern]) => normalized.includes(pattern));

  return mapped?.[1] ?? message;
}
