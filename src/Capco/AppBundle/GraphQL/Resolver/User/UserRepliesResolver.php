<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserRepliesResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly ReplyRepository $replyRepository,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    public function __invoke(?User $viewer, User $user, ?Argument $args = null, ?\ArrayObject $context = null): ConnectionInterface|Promise
    {
        $args ??= new Argument(['first' => 0]);
        $this->protectArguments($args);

        $authorized = $this->replyRepository->createQueryBuilder('authorizedReply')
            ->select('authorizedReply.id')
            ->andWhere('authorizedReply.author = :contributor')->setParameter('contributor', $user);
        $this->resultsAccess->restrictReplyQuery($authorized, 'authorizedReply', $viewer, $context);
        $query = $this->replyRepository->getProfileVisibleByAuthorQueryBuilder($viewer, $user)
            ->orWhere('reply.id IN (' . $authorized->getDQL() . ')')
            ->distinct()
        ;
        foreach ($authorized->getParameters() as $parameter) {
            $query->setParameter($parameter->getName(), $parameter->getValue());
        }
        $filters = $this->entityManager->getFilters();
        $wasEnabled = $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME);
        if ($wasEnabled) {
            $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        try {
            $totalCount = (int) (clone $query)->select('COUNT(DISTINCT reply.id)')->getQuery()->getSingleScalarResult();
            $paginator = new Paginator(fn (int $offset, int $limit) => (clone $query)
                ->orderBy('reply.createdAt', 'DESC')->addOrderBy('reply.id', 'ASC')
                ->setFirstResult($offset)->setMaxResults($limit)->getQuery()->getResult());

            return $paginator->auto($args, $totalCount);
        } finally {
            if ($wasEnabled) {
                $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME);
            }
        }
    }
}
