<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerInterface;

class UserContributionsByConsultationResolver implements ResolverInterface
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function __invoke(User $user, Consultation $consultation, Argument $args): Connection
    {
        $paginator = new Paginator(static function (int $offset, int $limit) {
            return [];
        });

        $totalCount = 0;
        $totalCount += $this->container
            ->get(OpinionRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(OpinionVersionRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(ArgumentRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(SourceRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(OpinionVoteRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(ArgumentVoteRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(SourceVoteRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);
        $totalCount += $this->container
            ->get(OpinionVersionVoteRepository::class)
            ->countByAuthorAndConsultation($user, $consultation);

        return $paginator->auto($args, $totalCount);
    }
}
