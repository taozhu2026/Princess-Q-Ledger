function extractErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "";
}

export function getErrorMessage(
  error: unknown,
  fallback = "操作没有成功，请稍后再试。",
) {
  const message = extractErrorMessage(error);

  if (!message) {
    return fallback;
  }

  if (/row-level security/i.test(message)) {
    return "当前权限不足，暂时不能执行这项操作。";
  }

  if (/duplicate key value|unique constraint/i.test(message)) {
    return "已经存在相同内容，换一个名称再试。";
  }

  return message;
}
