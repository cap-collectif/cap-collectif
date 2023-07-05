<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class UserHasReplyResolver implements ResolverInterface
{
    private $replyRepository;
    private $userRepository;
    private $logger;

    public function __construct(
        ReplyRepository $replyRepository,
        UserRepository $userRepository,
        LoggerInterface $logger
    ) {
        $this->replyRepository = $replyRepository;
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Questionnaire $questionnaire, Argument $args): bool
    {
        $user = $this->userRepository->findOneByEmail($args->offsetGet('login'));

        if (!$user) {
            $this->logger->warning(__CLASS__ . ' : Could not find user.');

            return false;
        }

        return !$this->replyRepository
            ->getForUserAndQuestionnaire($questionnaire, $user, true)
            ->isEmpty()
        ;
    }
}
