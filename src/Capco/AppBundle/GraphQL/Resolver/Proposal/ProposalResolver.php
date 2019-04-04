<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function resolveShowUrlBySlug(
        string $projectSlug,
        string $stepSlug,
        string $proposalSlug
    ): ?string {
        return $this->router->generate(
            'app_project_show_proposal',
            compact('projectSlug', 'stepSlug', 'proposalSlug'),
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
