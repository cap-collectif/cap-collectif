<?php

declare(strict_types=1);

namespace Capco\AppBundle\Provider;

interface LocaleProviderInterface
{
    public function provideCurrentLocale(): ?string;

    public function provideFallbackLocale(): ?string;
}
