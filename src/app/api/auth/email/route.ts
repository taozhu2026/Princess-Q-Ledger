import { NextResponse } from "next/server";

import { parseAuthEmailRequest } from "@/shared/lib/auth-email/request";
import { sendAuthEmail } from "@/shared/lib/auth-email/service";

const INVALID_REQUEST_RESULT = {
  ok: false,
  message: "请求格式不正确，请刷新页面后重试。",
  nextStep: "signed_out" as const,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const authEmailRequest = parseAuthEmailRequest(body);

    if (!authEmailRequest) {
      return NextResponse.json(INVALID_REQUEST_RESULT, {
        status: 400,
      });
    }

    const origin = new URL(request.url).origin;
    const result = await sendAuthEmail(authEmailRequest, origin);

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    });
  } catch (error) {
    console.error("[auth-email] Unexpected route failure:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "认证邮件服务暂时不可用，请稍后再试。",
        nextStep: "signed_out" as const,
      },
      {
        status: 500,
      },
    );
  }
}
