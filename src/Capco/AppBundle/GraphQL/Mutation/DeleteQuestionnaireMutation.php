<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteQuestionnaireMutation implements MutationInterface
{
    public const QUESTIONNAIRE_NOT_FOUND = 'QUESTIONNAIRE_NOT_FOUND';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(EntityManagerInterface $em, GlobalIdResolver $globalIdResolver)
    {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('id');
        $questionnaire = $this->globalIdResolver->resolve($id, $viewer);

        if (!$questionnaire) {
            return ['errorCode' => self::QUESTIONNAIRE_NOT_FOUND];
        }

        $this->em->remove($questionnaire);
        $this->em->flush();

        return ['errorCode' => null];
    }
}
