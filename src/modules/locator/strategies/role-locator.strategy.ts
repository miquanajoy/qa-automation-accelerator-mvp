import type { LocatorStrategy } from "../types/locator.type";
import { elementName, locator, quote } from "./locator-strategy.helpers";

const implicitRolesByTag: Record<string, string> = {
  a: "link",
  button: "button",
  select: "combobox",
  textarea: "textbox"
};

export const roleLocatorStrategy: LocatorStrategy = {
  name: "role",
  priority: 4,
  generate(element) {
    const role = element.role ?? implicitRolesByTag[element.tagName];
    const name = elementName(element);

    if (!role || !name) {
      return [];
    }

    return [
      locator(
        "playwright:role",
        `page.getByRole('${quote(role)}', { name: '${quote(name)}' })`,
        90,
        "Prefer accessible role locator",
        "Role plus accessible name matches how users and assistive tech identify the element."
      )
    ];
  }
};
