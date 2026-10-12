<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class UserHasReplyResolver implements QueryInterface
{
    public function __construct(
        private readonly ReplyRepository $replyRepository,
        private readonly UserRepository $userRepository,
        private readonly LoggerInterface $logger,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(Questionnaire $questionnaire, Argument $args, ?User $viewer = null, ?\ArrayObject $context = null): bool
    {
        if (!$this->resultsAccess->canViewResults($questionnaire, $context)
            && (!$viewer || 0 !== strcasecmp($viewer->getEmail(), (string) $args->offsetGet('login')))) {
            return false;
        }

        $user = $this->userRepository->findOneByEmail($args->offsetGet('login'));

        if (!$user) {
            $this->logger->warning(self::class . ' : Could not find user.');

            return false;
        }

        return !$this->replyRepository
            ->getForUserAndQuestionnaire($questionnaire, $user, true)
            ->isEmpty()
        ;
    }
}
