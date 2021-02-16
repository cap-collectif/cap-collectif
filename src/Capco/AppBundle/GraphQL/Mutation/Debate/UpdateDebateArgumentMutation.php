<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateDebateArgumentMutation extends AbstractDebateArgumentMutation implements
    MutationInterface
{
    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debateArgument = $this->getArgument($input, $viewer);
            $this->checkUpdateRightsOnArgument($debateArgument);
            $debateArgument->setBody(strip_tags($input->offsetGet('body')));

            $this->em->flush($debateArgument);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument');
    }
}
