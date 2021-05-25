<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;

class CreateDebateAnonymousArgumentMutation extends CreateDebateArgumentMutation
{
    public function __invoke(Arg $input, ?User $viewer = null): array
    {
        try {
            $debate = $this->getDebateFromInput($input, null);
            self::checkDebateIsOpen($debate);
            $this->checkCreateRights($debate, null, $input);

            $debateArgument = (new DebateAnonymousArgument($debate))
                ->setEmail($input->offsetGet('email'))
                ->setUsername($input->offsetGet('username'))
                ->setToken($this->tokenGenerator->generateToken());

            self::setDebateArgumentOrigin($debateArgument, $input);
            self::setDebateArgumentContent($debateArgument, $input);

            $this->saveAndIndex($debateArgument);
            $this->debateNotifier->sendArgumentConfirmation($debateArgument);
            $token = $debateArgument->getToken();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument', 'token');
    }
}
