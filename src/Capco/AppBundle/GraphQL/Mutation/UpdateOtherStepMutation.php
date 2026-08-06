<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\HubApiGreenClient;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Enum\LogActionType;
use Capco\AppBundle\Form\Step\OtherStepFormType;
use Capco\AppBundle\GraphQL\Exceptions\GraphQLException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Project\ProjectUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Logger\ActionLogger;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateOtherStepMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly FormFactoryInterface $formFactory,
        private readonly LoggerInterface $logger,
        private readonly ActionLogger $actionLogger,
        private readonly HubApiGreenClient $hubApiGreenClient,
        private readonly Manager $toggleManager,
        private readonly ProjectUrlResolver $projectUrlResolver
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $data = $input->getArrayCopy();

        $step = $this->getStep($data['stepId'], $viewer);
        $step->setTitle('');

        $operationType = $data['operationType'];

        unset($data['stepId'], $data['operationType']);

        $hubMetadataRequired = (bool) ($data['hubMetadata']['enabled'] ?? false);
        $form = $this->formFactory->create(OtherStepFormType::class, $step, [
            'hub_metadata_required' => $hubMetadataRequired,
        ]);
        $form->submit($data, false);

        if (!$form->isValid()) {
            $this->logger->error(__METHOD__ . ' : ' . $form->getErrors(true, false));

            throw GraphQLException::fromFormErrors($form);
        }

        if ($step->getHubMetadata()?->isEnabled() && !$step->getHubMetadata()->isComplete()) {
            throw GraphQLException::fromString('Hub API Green metadata is required when the association is enabled.');
        }

        $this->em->persist($step);
        $this->em->flush();

        $hubMetadata = $step->getHubMetadata();
        $project = $step->getProject();
        if (
            $this->toggleManager->isActive(Manager::hub_api_green)
            && $hubMetadata?->isEnabled()
            && $hubMetadata->isComplete()
            && $project
        ) {
            try {
                $this->hubApiGreenClient->associateFolder($step, $hubMetadata, $this->projectUrlResolver->__invoke($project));
            } catch (\RuntimeException $exception) {
                $this->logger->error('Hub API Green folder association failed while updating an other step.', [
                    'stepId' => $step->getId(),
                    'exception' => $exception,
                ]);

                throw GraphQLException::fromString(
                    'L’association du dossier au registre a échoué. Vérifiez le numéro de dossier, le code AIOT et l’adresse e-mail de contact, puis réessayez.'
                );
            }
        }

        $this->actionLogger->logGraphQLMutation(
            $viewer,
            LogActionType::CREATE === $operationType ? LogActionType::CREATE : LogActionType::EDIT,
            sprintf('l\'étape %s du projet %s', $step->getTitle(), $step->getProject()->getTitle()),
            $step::class,
            $step->getId()
        );

        return ['step' => $step];
    }

    public function isGranted(string $stepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $step = $this->getStep($stepId, $viewer);
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
    }

    private function getStep(string $stepId, User $viewer): OtherStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        if (!$step instanceof OtherStep) {
            throw new UserError('Given step is not of type OtherStep');
        }

        return $step;
    }
}
