<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Symfony\Component\Form\FormFactoryInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateDebateArgumentMutation implements MutationInterface
{
    public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';

    private EntityManagerInterface $em;
    private FormFactoryInterface $formFactory;
    private GlobalIdResolver $globalIdResolver;


    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        GlobalIdResolver $globalIdResolver

    ) {
        $this->em = $em;
        $this->formFactory = $formFactory;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debate = $this->getDebateFromInput($input, $viewer);
            $debateArgument = new DebateArgument($debate);
            $debateArgument->setAuthor($viewer);
            $debateArgument->setBody(strip_tags($input->offsetGet('body')));
            $debateArgument->setType($input->offsetGet('type'));

            $this->em->persist($debateArgument);
            $this->em->flush($debateArgument);
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return compact('debateArgument');
    }

    private function getDebateFromInput(Arg $input, User $viewer): Debate
    {
        $debate = $this->globalIdResolver->resolve($input->offsetGet('debate'), $viewer);
        if (!($debate instanceof Debate)) {
            throw new UserError(self::UNKNOWN_DEBATE);
        }

        return $debate;
    }
}
