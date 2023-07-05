<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Form\DebateStepType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
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
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;
    private FormFactoryInterface $formFactory;
    private LoggerInterface $logger;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        FormFactoryInterface $formFactory,
        LoggerInterface $logger
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
        $this->formFactory = $formFactory;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $data = $input->getArrayCopy();
        $debateStepId = $input->offsetGet('id');
        $debateStep = $this->getDebateStep($debateStepId, $viewer);

        unset($data['id']);

        $form = $this->formFactory->create(DebateStepType::class, $debateStep);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        $this->em->flush();

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
