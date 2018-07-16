<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Repository\OpinionVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class OpinionVotesResolver implements ResolverInterface
{
    private $logger;
    private $voteRepository;

    public function __construct(
        OpinionVoteRepository $voteRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->voteRepository = $voteRepository;
    }

    public function __invoke($votable, Argument $args) : Connection
    {
        $includeExpired = false;
        $type = $args->offsetGet('type');
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        $paginator = new Paginator(function (int $offset, int $limit) use ($votable, $type, $field, $direction) {
            return $this->voteRepository->getByContribution($votable, $limit, $offset, $field, $direction)->getIterator()->getArrayCopy();
        });
        $totalCount = $this->voteRepository->countByContribution($votable);

        return $paginator->auto($args, $totalCount);
    }

    // public function resolvePropositionVotes(Opinion $proposition, Arg $argument)
    // {
    //     return $this->container->get('doctrine')->getManager()
    //         ->createQuery('SELECT PARTIAL vote.{id, value, createdAt, expired}, PARTIAL author.{id}, PARTIAL opinion.{id} FROM CapcoAppBundle:OpinionVote vote LEFT JOIN vote.user author LEFT JOIN vote.opinion opinion WHERE vote.opinion = \'' . $proposition->getId() . '\'')
    //         // ->setMaxResults(50)
    //         ->getArrayResult();
    // }
}
