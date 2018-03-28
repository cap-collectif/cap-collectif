<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserContributionByStepResolver
{
    private $container;

    public function __construct($container)
    {
        $this->container = $container;
    }

    public function __invoke(User $user, AbstractStep $step, array $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) {
            return [];
        });

        $totalCount = 0;
        if ($step instanceof ConsultationStep) {
            $totalCount += $this->container->get('capco.opinion.repository')->countByAuthorAndStep($user, $step);
            $totalCount += $this->container->get('capco.opinion_version.repository')->countByAuthorAndStep($user, $step);
            $totalCount += $this->container->get('capco.argument.repository')->countByAuthorAndStep($user, $step);
            $totalCount += $this->container->get('capco.source.repository')->countByAuthorAndStep($user, $step);
        }

        // $totalCount += $this->container->get('capco.opinion_vote.repository')->countByAuthorAndProject($user, $project);
        // $totalCount += $this->container->get('capco.argument_vote.repository')->countByAuthorAndProject($user, $project);
        // $totalCount += $this->container->get('capco.source_vote.repository')->countByAuthorAndProject($user, $project);
        // $totalCount += $this->container->get('capco.opinion_version_vote.repository')->countByAuthorAndProject($user, $project);

        return $paginator->auto($args, $totalCount);
    }
}
