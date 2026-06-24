import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import type {
  PageObjectSourceElement,
  PageObjectSourcePage
} from "../types/page-object.type";
import { PageObjectGeneratorService } from "./page-object-generator.service";

function element(
  input: Partial<PageObjectSourceElement> & Pick<PageObjectSourceElement, "id">
): PageObjectSourceElement {
  return {
    id: input.id,
    tagName: input.tagName ?? "div",
    elementId: input.elementId ?? null,
    text: input.text ?? null,
    role: input.role ?? null,
    ariaLabel: input.ariaLabel ?? null,
    name: input.name ?? null,
    placeholder: input.placeholder ?? null,
    type: input.type ?? null,
    href: input.href ?? null,
    testId: input.testId ?? null,
    locators: input.locators ?? []
  };
}

const sourcePage: PageObjectSourcePage = {
  id: "login-page",
  url: "https://example.com/login",
  title: "Login",
  elements: [
    element({
      id: "email",
      tagName: "input",
      placeholder: "Email",
      locators: [
        {
          locatorType: "playwright:css",
          locatorValue: "page.locator('form > input:nth-of-type(1)')",
          score: 15,
          recommendation: "Avoid"
        },
        {
          locatorType: "playwright:placeholder",
          locatorValue: "page.getByPlaceholder('Email')",
          score: 65,
          recommendation: "Weak"
        }
      ]
    }),
    element({
      id: "password",
      tagName: "input",
      placeholder: "Password",
      locators: [
        {
          locatorType: "playwright:placeholder",
          locatorValue: "page.getByPlaceholder('Password')",
          score: 65,
          recommendation: "Weak"
        }
      ]
    }),
    element({
      id: "login-button",
      tagName: "button",
      text: "Login",
      role: "button",
      locators: [
        {
          locatorType: "playwright:role",
          locatorValue: "page.getByRole('button', { name: 'Login' })",
          score: 80,
          recommendation: "Acceptable"
        }
      ]
    }),
    element({
      id: "forgot-link",
      tagName: "a",
      text: "Forgot password",
      href: "/forgot",
      locators: [
        {
          locatorType: "playwright:role",
          locatorValue:
            "page.getByRole('link', { name: 'Forgot password' })",
          score: 80,
          recommendation: "Acceptable"
        }
      ]
    })
  ]
};

test("generates a Playwright TypeScript Page Object with basic actions", () => {
  const result = new PageObjectGeneratorService().generateCode(sourcePage);

  assert.equal(result.className, "LoginPage");
  assert.equal(result.filename, "LoginPage.ts");
  assert.match(
    result.content,
    /import \{ type Locator, type Page \} from "@playwright\/test";/
  );
  assert.match(result.content, /readonly emailInput: Locator;/);
  assert.match(
    result.content,
    /this\.emailInput = page\.getByPlaceholder\('Email'\);/
  );
  assert.doesNotMatch(result.content, /form > input:nth-of-type/);
  assert.match(
    result.content,
    /async fillEmailInput\(value: string\): Promise<void>/
  );
  assert.match(result.content, /async clickLoginButton\(\): Promise<void>/);
  assert.match(
    result.content,
    /async clickForgotPasswordLink\(\): Promise<void>/
  );
});

test("generates only selected element properties", () => {
  const result = new PageObjectGeneratorService().generateCode(sourcePage, [
    "email",
    "login-button"
  ]);

  assert.match(result.content, /readonly emailInput: Locator;/);
  assert.match(result.content, /readonly loginButton: Locator;/);
  assert.doesNotMatch(result.content, /passwordInput/);
  assert.doesNotMatch(result.content, /forgotPasswordLink/);
});

test("uses the page URL when title is unavailable", () => {
  const result = new PageObjectGeneratorService().generateCode({
    ...sourcePage,
    title: null,
    url: "https://example.com/account/settings"
  });

  assert.equal(result.className, "SettingsPage");
});

test("produces syntactically valid TypeScript", () => {
  const result = new PageObjectGeneratorService().generateCode(sourcePage);
  const transpiled = ts.transpileModule(result.content, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022
    },
    reportDiagnostics: true
  });
  const errors =
    transpiled.diagnostics?.filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
    ) ?? [];

  assert.deepEqual(errors, []);
});
