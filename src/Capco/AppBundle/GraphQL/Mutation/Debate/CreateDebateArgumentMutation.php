<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateDebateArgumentMutation extends AbstractDebateArgumentMutation implements MutationInterface
{
    public function __invoke(Arg $input, ?User $viewer = null): array
    {
        try {
            $debate = $this->getDebateFromInput($input, $viewer);
            $this->checkCreateRights($debate, $viewer, $input);

            $debateArgument = (new DebateArgument($debate))->setAuthor($viewer);
            $this->setDebateArgumentOrigin($debateArgument, $input);
            self::setDebateArgumentContent($debateArgument, $input);

            $this->saveAndIndex($debateArgument);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument');
    }

    protected function saveAndIndex(DebateArgumentInterface $debateArgument): void
    {
        $this->em->persist($debateArgument);
        $this->em->flush();
        $this->indexer->index(ClassUtils::getClass($debateArgument), $debateArgument->getId());
        $this->indexer->finishBulk();
    }

    protected function setDebateArgumentOrigin(
        DebateArgumentInterface $argument,
        Arg $input
    ): DebateArgumentInterface {
        $widgetOriginURI = $input->offsetGet('widgetOriginURI');
        if ($widgetOriginURI) {
            $argument->setWidgetOriginUrl($widgetOriginURI);
        }

        $argument
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
        ;

        return $argument;
    }

    protected static function setDebateArgumentContent(
        DebateArgumentInterface $debateArgument,
        Arg $input
    ): DebateArgumentInterface {
        $debateArgument->setBody(strip_tags((string) $input->offsetGet('body')));
        $debateArgument->setType($input->offsetGet('type'));

        return $debateArgument;
    }
}
