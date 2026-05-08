import { getAppEnv } from "./app-env";

describe("getAppEnv", () => {
  it("keeps the app usable when optional OpenAI and invite-code config is missing", () => {
    const config = getAppEnv({
      DATABASE_URL: "postgresql://user:pass@example.com:5432/app",
    });

    expect(config.database).toEqual({
      configured: true,
      url: "postgresql://user:pass@example.com:5432/app",
      directUrl: null,
    });
    expect(config.openai).toEqual({
      generationEnabled: false,
      model: "gpt-4.1-mini",
      apiKey: null,
    });
    expect(config.auth).toEqual({
      loginEnabled: true,
      registrationEnabled: false,
      inviteCode: null,
      secret: null,
    });
  });

  it("treats empty optional environment values as missing configuration", () => {
    const config = getAppEnv({
      DATABASE_URL: "postgresql://user:pass@example.com:5432/app",
      DATABASE_URL_UNPOOLED: "",
      AUTH_SECRET: "",
      INVITE_CODE: "",
      OPENAI_API_KEY: "",
      OPENAI_MODEL: "",
    });

    expect(config.database).toEqual({
      configured: true,
      url: "postgresql://user:pass@example.com:5432/app",
      directUrl: null,
    });
    expect(config.openai).toEqual({
      generationEnabled: false,
      model: "gpt-4.1-mini",
      apiKey: null,
    });
    expect(config.auth).toEqual({
      loginEnabled: true,
      registrationEnabled: false,
      inviteCode: null,
      secret: null,
    });
  });

  it("enables generator and registration when their environment config is present", () => {
    const config = getAppEnv({
      DATABASE_URL: "postgresql://user:pass@example.com:5432/app",
      AUTH_SECRET: "auth-secret",
      INVITE_CODE: "invite-demo",
      OPENAI_API_KEY: "sk-test",
      OPENAI_MODEL: "gpt-4.1",
    });

    expect(config.openai).toEqual({
      generationEnabled: true,
      model: "gpt-4.1",
      apiKey: "sk-test",
    });
    expect(config.auth).toEqual({
      loginEnabled: true,
      registrationEnabled: true,
      inviteCode: "invite-demo",
      secret: "auth-secret",
    });
  });
});
