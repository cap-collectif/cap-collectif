<?php

declare(strict_types=1);

namespace Capco\Tests;

use App\Kernel;

final class SamlTestKernel extends Kernel
{
    public function getCacheDir(): string
    {
        // SAML services are removed at compile time when their environment flag is disabled.
        return parent::getCacheDir() . '/saml-contracts';
    }
}
