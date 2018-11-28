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

class ProposalUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(Proposal $proposal): string
    {
        $step = $proposal->getStep();
        $project = $step->getProject();
        if (!$project) {
            return '';
        }

        return $this->router->generate(
            'app_project_show_proposal',
            [
                'proposalSlug' => $proposal->getSlug(),
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
