<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use ArrayObject;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserWarning;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalAdminUrlResolver implements ResolverInterface
{
    use ResolverTrait;

    protected $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(Proposal $proposal, $viewer, ?ArrayObject $context = null): ?string
    {
        $isAuthorized = $this->isAdminOrAuthorized($context, $viewer);

        if (!$isAuthorized) {
            throw new UserWarning('Access denied to this field.');
        }

        return $this->getEditUrl($proposal);
    }

    public function getEditUrl(Proposal $proposal): string
    {
        return $this->router->generate(
            'admin_capco_app_proposal_edit',
            ['id' => $proposal->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
