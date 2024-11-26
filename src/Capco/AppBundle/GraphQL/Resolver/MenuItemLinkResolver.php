<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\MenuItem;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Validator\Constraints\Url;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class MenuItemLinkResolver implements QueryInterface
{
    private readonly RouterInterface $router;
    private readonly ValidatorInterface $validator;

    public function __construct(RouterInterface $router, ValidatorInterface $validator)
    {
        $this->router = $router;
        $this->validator = $validator;
    }

    public function __invoke(
        MenuItem $item,
        RequestStack $requestStack
    ): string {
        $request = $requestStack->getCurrentRequest();
        $locale = $request->getLocale();
        if ($item->getPage()) {
            return $this->router->generate('app_page_show', [
                'slug' => $item
                    ->getPage()
                    ->translate()
                    ->getSlug(),
                '_locale' => $locale,
            ]);
        }
        $url = $item->getLink($locale, true);

        if ('/' === $url) {
            return $this->router->generate('app_homepage', ['_locale' => $locale]);
        }

        $constraint = new Url([
            'message' => 'not_valid_url',
            'payload' => ['severity' => 'warning'],
        ]);

        $errorList = $this->validator->validate($url, $constraint);

        if (0 === \count($errorList)) {
            return $url ?? '';
        }

        $routeMatch = $this->router->match("/{$url}");
        $routeParams = $this->getUrlParams($routeMatch);

        if ('capco_app_cms' === $routeMatch['_route']) {
            $route = $this->router->generate(
                'capco_app_cms',
                array_merge(['url' => $url], $routeParams)
            );
        } else {
            $route = $this->router->generate(
                $routeMatch['_route'],
                array_merge(['_locale' => $locale], $routeParams)
            );
        }

        return $route;
    }

    /**
     * @param array<mixed> $routeMatch
     *
     * @return array<mixed>
     */
    private function getUrlParams(array $routeMatch): array
    {
        return array_filter(
            $routeMatch,
            function ($value) {
                return '_' !== $value[0];
            },
            \ARRAY_FILTER_USE_KEY
        );
    }
}
