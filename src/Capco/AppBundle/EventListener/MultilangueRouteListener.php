<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Enum\TranslationLocale;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Twig\Environment;

class MultilangueRouteListener
{
    public function __construct(
        private readonly Manager $manager,
        private readonly LocaleRepository $localeRepository,
        private readonly Environment $templating
    ) {
    }

    public function onKernelRequest(RequestEvent $event)
    {
        if ($urlLocalisation = self::getUrlLocalisation($event->getRequest())) {
            if (!$this->isFeatureActive()) {
                $this->render404($event);
            }
            if (!$this->isLocalePublished($urlLocalisation)) {
                $this->render404($event);
            }
        }
    }

    private function render404(RequestEvent $event): void
    {
        $event->setResponse(
            new Response($this->templating->render('@CapcoApp/Default/404.html.twig'))
        );
    }

    private function isFeatureActive(): bool
    {
        return $this->manager->isActive('multilangue');
    }

    private function isLocalePublished(string $localeCode): bool
    {
        return $this->localeRepository->isCodePublished($localeCode);
    }

    private static function getUrlLocalisation(Request $request): ?string
    {
        $urlPrefix = self::getUrlPrefix($request);
        if (!\in_array($urlPrefix, TranslationLocale::getAvailablePrefixes())) {
            return null;
        }
        foreach (TranslationLocale::getAvailableTypes() as $code) {
            if (explode('-', (string) $code)[0] === $urlPrefix) {
                return $code;
            }
        }

        return null;
    }

    private static function getUrlPrefix(Request $request): string
    {
        $explodedUri = explode('/', $request->getRequestUri());
        if ('' === $explodedUri[0] && isset($explodedUri[1])) {
            return $explodedUri[1];
        }

        return $explodedUri[0];
    }
}
