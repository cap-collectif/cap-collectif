<?php

declare(strict_types=1);

namespace Capco\AppBundle\Provider;

use Symfony\Component\DependencyInjection\Exception\InvalidArgumentException;
use Symfony\Component\DependencyInjection\Exception\ParameterNotFoundException;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Translation\TranslatorInterface;

final class LocaleProvider implements LocaleProviderInterface
{
    public function __construct(
        private readonly RequestStack $requestStack,
        private readonly ParameterBagInterface $parameterBag,
        private readonly ?TranslatorInterface $translator
    ) {
    }

    public function provideCurrentLocale(): ?string
    {
        $currentRequest = $this->requestStack->getCurrentRequest();
        if (!$currentRequest instanceof Request) {
            return null;
        }

        $currentLocale = $currentRequest->getLocale();
        if ('' !== $currentLocale) {
            return $currentLocale;
        }

        if (null !== $this->translator) {
            return $this->translator->getLocale();
        }

        return null;
    }

    public function provideFallbackLocale(): ?string
    {
        $currentRequest = $this->requestStack->getCurrentRequest();
        if (null !== $currentRequest) {
            return $currentRequest->getDefaultLocale();
        }

        try {
            if ($this->parameterBag->has('locale')) {
                return (string) $this->parameterBag->get('locale');
            }

            return (string) $this->parameterBag->get('kernel.default_locale');
        } catch (ParameterNotFoundException|InvalidArgumentException) {
            return null;
        }
    }
}
