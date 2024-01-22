<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ConsultationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class DeleteConsultationMutation implements MutationInterface
{
    use MutationTrait;

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;

    private AuthorizationChecker $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationChecker $authorizationChecker
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);

        $id = $input->offsetGet('id');
        $consultation = $this->getConsultation($id, $viewer);

        /** * @var ConsultationStep $step  */
        $step = $consultation->getStep();

        if ($step) {
            $step->removeConsultation($consultation);
        }

        $this->em->remove($consultation);
        $this->em->flush();

        return ['deletedConsultationId' => $id];
    }

    public function isGranted(string $id, User $viewer): bool
    {
        $consultation = $this->getConsultation($id, $viewer);

        return $this->authorizationChecker->isGranted(
            ConsultationVoter::DELETE,
            $consultation
        );
    }

    private function getConsultation(string $id, User $viewer): Consultation
    {
        $consultation = $this->globalIdResolver->resolve($id, $viewer);

        if (false === $consultation instanceof Consultation) {
            throw new UserError("No consultation found for the id : {$id}");
        }

        return $consultation;
    }
}
