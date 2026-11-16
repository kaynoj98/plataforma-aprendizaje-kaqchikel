const fs = require("node:fs");
// The reporting API caches error text and page snapshots independently of the trace.
function redact(text) {
  return text
    .replace(/(kaqchikel_session=)[^;\s"']+/gi, "$1[oculto]")
    .replace(/https?:\/\/[^\s"'<>]*[?&]X-Amz-[^\s"'<>]*/gi, "[enlace firmado]")
    .replace(/(authorization:\s*bearer\s+)\S+/gi, "$1[oculto]")
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[PostgreSQL local]");
}
class Redact {
  onTestEnd(_test, result) {
    for (const error of result.errors)
      for (const key of ["message", "stack", "snippet", "value"])
        if (typeof error[key] === "string") error[key] = redact(error[key]);
    for (const attachment of result.attachments) {
      if (!attachment.contentType?.startsWith("text/")) continue;
      if (attachment.body)
        attachment.body = Buffer.from(redact(attachment.body.toString()));
      if (attachment.path && fs.existsSync(attachment.path))
        fs.writeFileSync(
          attachment.path,
          redact(fs.readFileSync(attachment.path, "utf8")),
        );
    }
  }
}
module.exports = Redact;
