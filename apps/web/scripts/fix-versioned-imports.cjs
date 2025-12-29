const fs = require("fs");
const path = require("path");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const root = path.join(process.cwd(), "src", "components", "ui");
if (!fs.existsSync(root)) {
  console.error("UI folder not found:", root);
  process.exit(1);
}

const files = walk(root).filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
let changedCount = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  // Remove versions in scoped packages: "@scope/name@1.2.3" -> "@scope/name"
  after = after.replace(/"(@[^"@\s]+\/[^"@\s]+)@[^"\s]+"/g, '"$1"');

  // Remove versions in unscoped packages: "pkg@1.2.3" -> "pkg"
  after = after.replace(/"([a-zA-Z0-9._-]+)@[0-9][^"\s]*"/g, '"$1"');

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedCount++;
  }
}

console.log(`Updated ${changedCount} files (removed versioned imports).`);
