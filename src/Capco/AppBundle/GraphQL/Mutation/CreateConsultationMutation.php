<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\AppBundle\Security\ConsultationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class CreateConsultationMutation implements MutationInterface
{
    use MutationTrait;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;
    private SettableOwnerResolver $settableOwnerResolver;

    public function __construct(
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        SettableOwnerResolver $settableOwnerResolver
    ) {
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
        $this->settableOwnerResolver = $settableOwnerResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        $title = $input->offsetGet('title');

        $consultation = new Consultation();
        $consultation->setTitle($title);

        $consultation->setCreator($viewer);
        $consultation->setOwner(
            $this->settableOwnerResolver->__invoke($input->offsetGet('owner'), $viewer)
        );

        $this->em->persist($consultation);
        $this->em->flush();

        return ['consultation' => $consultation];
    }

    public function isGranted(?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        return $this->authorizationChecker->isGranted(
            ConsultationVoter::CREATE,
            new Consultation()
        );
    }
}
