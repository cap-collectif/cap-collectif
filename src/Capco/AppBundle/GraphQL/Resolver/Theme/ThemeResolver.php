<?php

namespace Capco\AppBundle\GraphQL\Resolver\Theme;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Repository\ThemeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ThemeResolver implements QueryInterface
{
    public function __construct(
        private readonly ThemeRepository $themeRepository
    ) {
    }

    public function __invoke(Argument $args): ?Theme
    {
        $theme = $this->themeRepository->find($args->offsetGet('id'));

        return $theme instanceof Theme ? $theme : null;
    }
}
