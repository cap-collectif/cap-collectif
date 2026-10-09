<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\MenuItem;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Validator\Constraints\Url;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MenuItemUrlGenerator
{
    public function __construct(
        private readonly RouterInterface $router,
        private readonly ValidatorInterface $validator
    ) {
    }

    public function generate(MenuItem $item, string $locale): string
    {
        if ($item->getPage()) {
            $slug = $item->getPage()->getSlug($locale, true);
            if (!$slug) {
                return '';
            }

            return $this->router->generate('app_page_show', [
                'slug' => $slug,
                '_locale' => $locale,
            ]);
        }
        $url = $item->getLink($locale, true) ?? '';
        if ('/' === $url) {
            return $this->router->generate('app_homepage', ['_locale' => $locale]);
        }
        if ('' === $url) {
            return '';
        }

        $constraint = new Url([
            'message' => 'not_valid_url',
            'payload' => ['severity' => 'warning'],
        ]);
        $errorList = $this->validator->validate($url, $constraint);

        if (0 === \count($errorList)) {
            return $url;
        }

        $pathLength = strcspn($url, '?#');
        $path = substr($url, 0, $pathLength);
        $suffix = substr($url, $pathLength);
        $routeMatch = $this->router->match('/' . ltrim($path, '/'));
        $routeParams = $this->getUrlParams($routeMatch);

        if ('capco_app_cms' === $routeMatch['_route']) {
            $route = $this->router->generate(
                'capco_app_cms',
                array_merge(['url' => $path], $routeParams)
            );
        } else {
            $route = $this->router->generate(
                $routeMatch['_route'],
                array_merge(['_locale' => $locale], $routeParams)
            );
        }

        if (str_starts_with($suffix, '?') && str_contains((string) $route, '?')) {
            $suffix = '&' . substr($suffix, 1);
        }

        return $route . $suffix;
    }

    /**
     * @param array<string, mixed> $routeMatch
     *
     * @return array<string, mixed>
     */
    private function getUrlParams(array $routeMatch): array
    {
        return array_filter(
            $routeMatch,
            fn ($value) => '_' !== $value[0],
            \ARRAY_FILTER_USE_KEY
        );
    }
}
