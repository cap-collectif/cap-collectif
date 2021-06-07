<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class SendConfirmationEmailDebateAnonymousArgumentMutation
    extends AbstractDebateArgumentMutation
    implements MutationInterface
{
    public const ALREADY_PUBLISHED_ARGUMENT = 'ALREADY_PUBLISHED_ARGUMENT';

    public function __invoke(Argument $input): array
    {
        try {
            self::checkDebateIsOpen($this->getDebateFromInput($input, null));
            $debateArgument = $this->getArgumentFromHash($input);
            $this->checkArgumentIsNotPublished($debateArgument);
            $this->debateNotifier->sendArgumentConfirmation($debateArgument);
        } catch (UserError $userError) {
            return ['errorCode' => $userError->getMessage()];
        }

        return compact('debateArgument');
    }

    private function checkArgumentIsNotPublished(DebateAnonymousArgument $argument): void
    {
        if ($argument->isPublished()) {
            throw new UserError(self::ALREADY_PUBLISHED_ARGUMENT);
        }
    }
}
