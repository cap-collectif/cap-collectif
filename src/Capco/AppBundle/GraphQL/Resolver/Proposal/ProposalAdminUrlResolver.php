<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;

class ProposalAdminUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(Proposal $proposal): string
    {
        return $this->router->generate(
            'admin_capco_app_proposal_edit',
            ['id' => $proposal->getId()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
