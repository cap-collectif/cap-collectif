<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateDebateArgumentMutation extends AbstractDebateArgumentMutation implements MutationInterface
{
    use MutationTrait;

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $debateArgument = $this->getArgument($input, $viewer);
            $this->checkUpdateRightsOnArgument($debateArgument);
            $debateArgument->setBody(strip_tags((string) $input->offsetGet('body')));

            $this->em->flush();
            $this->indexer->index(DebateArgument::class, $debateArgument->getId());
            $this->indexer->finishBulk();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument');
    }
}
