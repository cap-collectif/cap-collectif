<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Encoder\DebateAnonymousParticipationHashEncoder;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Validator\Constraints\CheckDebateAnonymousParticipationHashConstraint;
use Doctrine\Common\Util\ClassUtils;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteDebateAnonymousArgumentMutation extends AbstractDebateArgumentMutation implements
    MutationInterface
{
    public const UNKNOWN_DEBATE_ARGUMENT = 'UNKNOWN_DEBATE_ARGUMENT';
    public const CANNOT_DELETE_DEBATE_ARGUMENT = 'CANNOT_DELETE_DEBATE_ARGUMENT';

    public function __invoke(Arg $input): array
    {
        try {
            $debate = $this->getDebateFromInput($input, null);
            self::checkDebateIsOpen($debate);
            $argument = $this->getArgumentFromHash($input);
            $deletedDebateAnonymousArgumentId = $this->removeFromDbAndIndex($argument);
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

    private function getArgumentFromHash(Arg $input): DebateAnonymousArgument
    {
        $hash = $input->offsetGet('hash');
        $this->checkHash($hash);
        $argument = $this->anonymousRepository->findOneByHashData(
            (new DebateAnonymousParticipationHashEncoder())->decode($hash)
        );
        if (!$argument) {
            throw new UserError(self::UNKNOWN_DEBATE_ARGUMENT);
        }

        return $argument;
    }

    private function checkHash(string $hash): void
    {
        if (
            $this->validator
                ->validate($hash, [new CheckDebateAnonymousParticipationHashConstraint()])
                ->count() > 0
        ) {
            throw new UserError(self::INVALID_HASH);
        }
    }
}
