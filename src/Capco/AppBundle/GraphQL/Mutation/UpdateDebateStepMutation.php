<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Form\DebateStepType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateDebateStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly ActionLogger $actionLogger
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();
        $debateStepId = $input->offsetGet('id');
        $debateStep = $this->getDebateStep($debateStepId, $viewer);
        $operationType = $input->offsetGet('operationType');

        unset($data['id'], $data['operationType']);

        $form = $this->formFactory->create(DebateStepType::class, $debateStep);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

        $this->actionLogger->logGraphQLMutation(
            $viewer,
            LogActionType::CREATE === $operationType ? LogActionType::CREATE : LogActionType::EDIT,
            sprintf(
                'l\'étape %s du projet %s',
                $debateStep->getTitle(),
                $debateStep->getProject()->getTitle()
            ),
            DebateStep::class,
            $debateStep->getId()
        );

        return ['debateStep' => $debateStep];
    }

    public function isGranted(string $debateStepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }

        $debateStep = $this->getDebateStep($debateStepId, $viewer);
        $project = $debateStep->getProject();

        return $this->authorizationChecker->isGranted(
            ProjectVoter::EDIT,
            $project
        );
    }

    public function getDebateStep(string $debateStepId, User $viewer): DebateStep
    {
        $debate = $this->globalIdResolver->resolve($debateStepId, $viewer);
        if (!$debate instanceof DebateStep) {
            throw new UserError("Given debateStep id : {$debateStepId} is not valid");
        }

        return $debate;
    }
}
