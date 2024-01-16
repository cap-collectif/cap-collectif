<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

class UnstarResponseMutation extends StarResponseMutation
{
    use MutationTrait;

    public const NOT_STARRED = 'NOT_STARRED';

    public function __invoke(Argument $argument, User $viewer): array
    {
        try {
            $this->formatInput($argument);
            $response = $this->getResponse($argument, $viewer);
            $this->checkIsStarred($response, $viewer);
            $viewer->removeStarredResponse($response);
            $this->entityManager->flush();
            $this->publish($response);
        } catch (UserError $error) {
            return ['error' => $error->getMessage()];
        }

        return ['response' => $response];
    }

    private function checkIsStarred(AbstractResponse $response, User $viewer): void
    {
        if (!$this->isStarred($response, $viewer)) {
            throw new UserError(self::NOT_STARRED);
        }
    }
}
