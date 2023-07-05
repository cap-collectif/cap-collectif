<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class StarResponseMutation implements MutationInterface
{
    public const RESPONSE_NOT_FOUND = 'RESPONSE_NOT_FOUND';
    public const ALREADY_STARRED = 'ALREADY_STARRED';

    protected EntityManagerInterface $entityManager;
    protected GlobalIdResolver $globalIdResolver;
    protected Publisher $publisher;

    public function __construct(
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        Publisher $publisher
    ) {
        $this->entityManager = $entityManager;
        $this->globalIdResolver = $globalIdResolver;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $argument, User $viewer): array
    {
        try {
            $response = $this->getResponse($argument, $viewer);
            $this->checkNotAlreadyStarred($response, $viewer);
            $viewer->addStarredResponse($response);
            $this->entityManager->flush();
            $this->publish($response);
        } catch (UserError $error) {
            return ['error' => $error->getMessage()];
        }

        return ['response' => $response];
    }

    protected function isStarred(AbstractResponse $response, User $viewer): bool
    {
        return $viewer->getStarredResponses()->contains($response);
    }

    protected function getResponse(Argument $argument, User $viewer): AbstractResponse
    {
        $response = $this->globalIdResolver->resolve($argument->offsetGet('responseId'), $viewer);
        if (!($response instanceof AbstractResponse)) {
            throw new UserError(self::RESPONSE_NOT_FOUND);
        }

        return $response;
    }

    protected function publish(AbstractResponse $response): void
    {
        if ($response->getReply()) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'replyId' => $response->getReply()->getId(),
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE,
                    ])
                )
            );
        }
    }

    private function checkNotAlreadyStarred(AbstractResponse $response, User $viewer): void
    {
        if ($this->isStarred($response, $viewer)) {
            throw new UserError(self::ALREADY_STARRED);
        }
    }
}
