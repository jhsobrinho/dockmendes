$controllers = @(
    "auth.controller.js",
    "client.controller.js",
    "company.controller.js",
    "dock.controller.js",
    "product.controller.js",
    "user.controller.js"
)

foreach ($controller in $controllers) {
    $filePath = ".\controllers\$controller"
    $content = Get-Content $filePath -Raw
    $newContent = $content -replace "import db from '../models/index.js';", "import { models } from '../models/index.js';"
    $newContent = $newContent -replace "db\.", "models."
    Set-Content -Path $filePath -Value $newContent
}
