<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateDebateArgumentMutation implements MutationInterface
{
    public const UNKNOWN_DEBATE_ARGUMENT = 'UNKNOWN_DEBATE_ARGUMENT';
    public const NOT_ARGUMENT_AUTHOR = 'NOT_ARGUMENT_AUTHOR';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;


    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker

    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debateArgument = $this->getArgument($input, $viewer);
            $debateArgument->setAuthor($viewer);
            $debateArgument->setBody(strip_tags($input->offsetGet('body')));
            $debateArgument->setType($input->offsetGet('type'));

            $this->em->flush($debateArgument);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument');
    }

    private function getArgument(Arg $input, User $viewer): DebateArgument
    {
        $debateArgument = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);
        if (!($debateArgument instanceof DebateArgument)) {
            throw new UserError(self::UNKNOWN_DEBATE_ARGUMENT);
        }
        self::checkRightsOnArgument($debateArgument);

        return $debateArgument;
    }

    private function checkRightsOnArgument(DebateArgument $argument): void
    {
        if (!$this->authorizationChecker->isGranted(DebateArgumentVoter::UPDATE, $argument)) {
            throw new UserError(self::NOT_ARGUMENT_AUTHOR);
        }
    }
}
