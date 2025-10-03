<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Security\ConsultationVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteConsultationMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly ActionLogger $actionLogger
    ) {
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

        $actionDescription = sprintf('le formulaire de consultation %s', $consultation->getTitle());

        if (null !== $consultation->getStep()?->getProject()) {
            $actionDescription .= sprintf(' du projet %s', $consultation->getStep()->getTitle());
        }

        $this->actionLogger->logGraphQLMutation(
            $viewer,
            LogActionType::DELETE,
            $actionDescription,
            Consultation::class,
            $consultation->getId()
        );

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
