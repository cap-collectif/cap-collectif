<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Doctrine\Common\Util\ClassUtils;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteDebateAnonymousArgumentMutation extends AbstractDebateArgumentMutation implements MutationInterface
{
    public function __invoke(Arg $input): array
    {
        try {
            $debate = $this->getDebateFromInput($input, null);
            self::checkDebateIsOpen($debate);
            $argument = $this->getArgumentFromHash($input);
            $deletedDebateAnonymousArgumentId = GlobalId::toGlobalId(
                'DebateArgument',
                $this->removeFromDbAndIndex($argument)
            );
        } catch (UserError $userError) {
            return ['errorCode' => $userError->getMessage()];
        }

        return compact('debate', 'deletedDebateAnonymousArgumentId');
    }

    private function removeFromDbAndIndex(DebateAnonymousArgument $argument): string
    {
        $argumentId = $argument->getId();
        $this->em->remove($argument);
        $this->em->flush();
        $this->indexer->remove(ClassUtils::getclass($argument), $argumentId);
        $this->indexer->finishBulk();

        return $argumentId;
    }
}
