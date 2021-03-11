<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateDebateArgumentMutation extends AbstractDebateArgumentMutation implements
    MutationInterface
{
    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debate = $this->getDebateFromInput($input, $viewer);
            $this->checkCreateRights($debate, $viewer);
            $debateArgument = new DebateArgument($debate);
            self::setAuthor($debateArgument, $viewer);
            $debateArgument->setBody(strip_tags($input->offsetGet('body')));
            $debateArgument->setType($input->offsetGet('type'));

            $this->em->persist($debateArgument);
            $this->indexer->index(DebateArgument::class, $debateArgument->getId());
            $this->em->flush();
            $this->indexer->finishBulk();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument');
    }

    private static function setAuthor(DebateArgument $debateArgument, User $viewer): DebateArgument
    {
        return $debateArgument
            ->setAuthor($viewer)
            ->setNavigator($_SERVER['HTTP_USER_AGENT'] ?? null)
            ->setIpAddress($_SERVER['HTTP_TRUE_CLIENT_IP'] ?? null);
    }
}
