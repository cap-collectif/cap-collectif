<?php

declare(strict_types=1);

namespace Ci\System;

use Castor\Attribute\AsTask;
use function Local\System\generateSsl as localGenerateSsl;
use function Local\System\installGitHook as localInstallGitHook;

#[AsTask(description: 'Generate CI TLS certificates.')]
function generateSsl(): void
{
    localGenerateSsl();
}

#[AsTask(description: 'Install the Git hook in CI.')]
function installGitHook(): void
{
    localInstallGitHook();
}
