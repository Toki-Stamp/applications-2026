import { dict } from "$shared/locales/ru.js";

/**
 * Parses an error object and returns a formatted title and body using the locale dictionary.
 * @param {unknown} e
 * @returns {{ title: string, body: string }}
 */
export function parseApiError(e) {
  const msg = e instanceof Error ? e.message : String(e);

  let title = dict.modals.submitError.types.unknown.title;
  let body = dict.modals.submitError.types.unknown.bodyPrefix + msg;

  if (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("fetch")
  ) {
    title = dict.modals.submitError.types.network.title;
    body = dict.modals.submitError.types.network.body;
  } else if (
    msg.includes("Ошибка HTTP") ||
    msg.includes("500") ||
    msg.includes("404")
  ) {
    title = dict.modals.submitError.types.server.title;
    body = dict.modals.submitError.types.server.body;
  } else if (
    msg.includes("Неизвестная ошибка на стороне сервера") ||
    msg.includes("LogicError:")
  ) {
    title = dict.modals.submitError.types.logic.title;
    body =
      dict.modals.submitError.types.logic.bodyPrefix +
      msg.replace("LogicError:", "");
  } else if (
    msg.includes("GOOGLE_SCRIPT_URL") ||
    msg === "Failed to fetch data"
  ) {
    title = dict.modals.submitError.types.setup.title;
    body = dict.modals.submitError.types.setup.body;
  }

  return { title, body };
}
