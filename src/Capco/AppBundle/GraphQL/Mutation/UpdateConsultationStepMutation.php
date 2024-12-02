<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\Step\ConsultationStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\Error;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateConsultationStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly GlobalIdResolver $globalIdResolver, private readonly FormFactoryInterface $formFactory, private readonly EntityManagerInterface $em, private readonly LoggerInterface $logger, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();

        $stepId = $data['stepId'];
        $step = $this->getStep($stepId, $viewer);

        unset($data['stepId']);

        $form = $this->formFactory->create(ConsultationStepFormType::class, $step);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return ['consultationStep' => $step];
    }

    public function isGranted(string $stepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $step = $this->getStep($stepId, $viewer);
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    private function getStep(string $stepId, User $viewer): ConsultationStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);

        if (!$step instanceof ConsultationStep) {
            throw new Error("Given step with id: {$stepId} should be instance of ConsultationStep");
        }

        return $step;
    }
}
