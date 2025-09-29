<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Form\Step\CollectStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Service\ProposalStepSplitViewService;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateCollectStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly ProposalStepSplitViewService $proposalStepSplitViewService
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $collectStepId = $input->offsetGet('stepId');
        $collectStep = $this->getCollectStep($collectStepId, $viewer);

        unset($data['stepId']);

        $form = $this->formFactory->create(CollectStepFormType::class, $collectStep);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        return [
            'collectStep' => $collectStep,
            'proposalStepSplitViewWasDisabled' => $this->proposalStepSplitViewService->proposalStepSplitViewWasDisabled($collectStep, $data),
        ];
    }

    public function isGranted(string $collectStepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $collectStep = $this->getCollectStep($collectStepId, $viewer);
        $project = $collectStep->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    public function getCollectStep(string $collectStepId, User $viewer): CollectStep
    {
        $collectStep = $this->globalIdResolver->resolve($collectStepId, $viewer);
        if (!$collectStep instanceof CollectStep) {
            throw new UserError("Given collectStep id : {$collectStepId} is not valid");
        }

        return $collectStep;
    }
}
