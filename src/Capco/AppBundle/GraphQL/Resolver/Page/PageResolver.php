<?php

namespace Capco\AppBundle\GraphQL\Resolver\Page;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\PageRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PageResolver implements QueryInterface
{
    public function __construct(
        private readonly PageRepository $pageRepository
    ) {
    }

    public function __invoke(Argument $args): ?Page
    {
        $page = $this->pageRepository->find(GlobalIdResolver::getDecodedId((string) $args->offsetGet('id'), true));

        return $page instanceof Page ? $page : null;
    }
}
