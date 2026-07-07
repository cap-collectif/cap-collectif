<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalType;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class CreateProposalMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        protected LoggerInterface $logger,
        protected GlobalIdResolver $globalIdResolver,
        protected EntityManagerInterface $em,
        protected FormFactoryInterface $formFactory,
        protected ProposalFormRepository $proposalFormRepository,
        protected RedisStorageHelper $redisStorageHelper,
        protected ProposalFormProposalsDataLoader $proposalFormProposalsDataLoader,
        protected Indexer $indexer,
        protected Manager $toggleManager,
        protected ResponsesFormatter $responsesFormatter,
        protected ProposalRepository $proposalRepository,
        protected Publisher $publisher,
        protected readonly ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        protected readonly ViewerIsMeetingRequirementsResolver $viewerIsMeetingRequirementsResolver,
        protected readonly ParticipantHelper $participantHelper,
        protected readonly ParticipantRepository $participantRepository,
        protected readonly ProjectParticipantsTotalCountCacheHandler $participantsTotalCountCacheHandler,
        protected readonly TokenGeneratorInterface $tokenGenerator,
    ) {
    }

    /**
     * @throws \JsonException
     */
    public function __invoke(Argument $input, ?User $user = null): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();

        $participantToken = $values['participantToken'] ?? null;
        $contributor = $user ?: $this->participantHelper->getOrCreateParticipant($participantToken);

        $proposalForm = $this->getProposalForm($values, $contributor);
        $stepId = $proposalForm->getStep()?->getId();
        $argsRequirements = new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $stepId)]);
        if ($contributor instanceof User) {
            $isViewerMeetingRequirementsOrIsParticipantMeetingRequirements = $this->viewerIsMeetingRequirementsResolver->__invoke(
                $argsRequirements,
                $contributor
            );
        } else {
            $isViewerMeetingRequirementsOrIsParticipantMeetingRequirements = $this->participantIsMeetingRequirementsResolver->__invoke(
                $contributor,
                $argsRequirements
            );
        }

        if (isset($values['participantToken'])) {
            unset($values['participantToken']);
        }

        unset($values['proposalFormId']); // This only useful to retrieve the proposalForm
        $draft = false;
        if (isset($values['draft'])) {
            $draft = $values['draft'];
            unset($values['draft']);
        }

        if (
            \count(
                $this->proposalRepository->findCreatedSinceIntervalByAuthor(
                    $contributor,
                    'PT1M',
                    $contributor instanceof User ? 'author' : 'participant'
                )
            ) >= 2
        ) {
            $this->logger->error('You contributed too many times.');
            $error = ['message' => 'You contributed too many times.'];

            return ['argument' => null, 'argumentEdge' => null, 'userErrors' => [$error], 'shouldTriggerWorkflow' => false];
        }

        $proposal = $this->createAndIndexProposal(
            $values,
            $proposalForm,
            $draft,
            ProposalType::class,
            $contributor
        );
        $shouldTriggerWorkflow = null;
        if (!$isViewerMeetingRequirementsOrIsParticipantMeetingRequirements) {
            $proposal->setMissingRequirementsStatus();
            $shouldTriggerWorkflow = true;
        } else {
            $proposal->setCompletedStatus();
        }

        if ($contributor instanceof Participant) {
            $contributor->setLastContributedAt(new \DateTime());
        }

        $project = $proposalForm->getStep()?->getProject();
        $hasAlreadyParticipatedInThisProject = true;
        if ($contributor instanceof Participant && $project) {
            $hasAlreadyParticipatedInThisProject = $this->participantRepository
                ->findWithContributionsByProjectAndParticipant($project, $contributor)
            ;
        }

        $this->em->flush();

        if ($contributor instanceof Participant && $project && !$draft) {
            $this->participantsTotalCountCacheHandler->incrementTotalCount(
                project: $project,
                conditionCallBack: fn ($cachedItem) => $cachedItem->isHit()
                    && $isViewerMeetingRequirementsOrIsParticipantMeetingRequirements
                    && !$hasAlreadyParticipatedInThisProject
            );
        }

        if (null === $shouldTriggerWorkflow) {
            $shouldTriggerWorkflow = $this->getShouldTriggerWorkflow($proposalForm, $contributor);
        }

        $messageBody = json_encode(['proposalId' => $proposal->getId()]);
        if (false === $messageBody) {
            throw new UserError('Could not encode proposalId.');
        }

        if (false === $shouldTriggerWorkflow) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_CREATE,
                new Message($messageBody)
            );
        }

        $participantToken = $contributor instanceof Participant ? $contributor->getToken() : null;

        return ['proposal' => $proposal, 'participantToken' => $participantToken, 'shouldTriggerWorkflow' => $shouldTriggerWorkflow];
    }

    protected function getProposalForm(array $values, ?ContributorInterface $contributor = null): ProposalForm
    {
        /** @var null|ProposalForm $proposalForm */
        $proposalForm = $this->proposalFormRepository->find($values['proposalFormId']);
        if (null === $proposalForm) {
            $error = sprintf('Unknown proposalForm with id "%s"', $values['proposalFormId']);
            $this->logger->error($error);

            throw new UserError($error);
        }

        /** @var ContributorInterface $contributor */
        if (!$this->canContributeToStep($contributor, $proposalForm)) {
            throw new UserError('You can no longer contribute to this collect step.');
        }

        return $proposalForm;
    }

    protected function createAndIndexProposal(
        array $values,
        ProposalForm $proposalForm,
        bool $draft,
        string $formType,
        ContributorInterface $contributor
    ): Proposal {
        $values = $this->fixValues($values, $proposalForm);
        $proposal = new Proposal();
        $follower = null;
        if ($contributor instanceof User) {
            $follower = new Follower();
            $follower->setUser($contributor);
            $follower->setProposal($proposal);
            $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);
        }

        if ($contributor instanceof Participant) {
            $values['participant'] = $contributor;
        }

        $proposal
            ->setDraft($draft)
            ->setAuthor($contributor)
            ->setEmailToken($this->tokenGenerator->generateToken())
            ->setProposalForm($proposalForm)
        ;

        if ($contributor instanceof User) {
            $proposal->addFollower($follower);
        }

        if (isset($values['publishedAt'])) {
            $publishedAt =
                $values['publishedAt'] instanceof \DateTime
                    ? $values['publishedAt']
                    : new \DateTime($values['publishedAt']);
            unset($values['publishedAt']);
            $proposal->setPublishedAt($publishedAt);
        }

        if (
            $proposalForm->getStep()
            && ($defaultStatus = $proposalForm->getStep()->getDefaultStatus())
        ) {
            $proposal->setStatus($defaultStatus);
        }

        $values = ProposalMutation::hydrateSocialNetworks($values, $proposal, $proposalForm, true);
        if ($contributor instanceof Author) {
            $this->linkProposalAuthorToResponses($contributor, $values);
        }

        $form = $this->formFactory->create($formType, $proposal, [
            'proposalForm' => $proposalForm,
            'validation_groups' => [$draft ? 'ProposalDraft' : 'Default'],
        ]);

        $this->logger->info(__METHOD__ . json_encode($values, \JSON_THROW_ON_ERROR));
        $form->submit($values);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }
        if ($contributor instanceof User) {
            $this->em->persist($follower);
        }
        $this->em->persist($proposal);
        if ($contributor instanceof User) {
            $this->redisStorageHelper->recomputeUserCounters($contributor);
        }

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();
        $this->proposalFormProposalsDataLoader->invalidate($proposalForm);

        return $proposal;
    }

    protected function fixValues(array $values, ProposalForm $proposalForm): array
    {
        if (
            isset($values['theme'])
            && (!$this->toggleManager->isActive('themes') || !$proposalForm->isUsingThemes())
        ) {
            unset($values['theme']);
        }

        if (isset($values['category']) && !$proposalForm->isUsingCategories()) {
            unset($values['category']);
        }

        if (
            isset($values['districts'])
            && (!$this->toggleManager->isActive('districts') || !$proposalForm->isUsingDistrict())
        ) {
            unset($values['district']);
        }

        if (isset($values['address']) && !$proposalForm->getUsingAddress()) {
            unset($values['address']);
        }

        if (isset($values['responses'])) {
            $values['responses'] = $this->responsesFormatter->format($values['responses']);
        }

        return $values;
    }

    /**
     * @param FormInterface<Proposal> $form
     *
     * @throws UserErrors
     */
    protected function handleErrors(FormInterface $form): void
    {
        $errors = [];
        foreach ($form->getErrors(true) as $error) {
            $this->logger->error(__METHOD__ . ' : ' . $error->getMessage());
            $this->logger->error(
                sprintf(
                    '%s : %s Extra data: %s',
                    __METHOD__,
                    $form->getName(),
                    implode('', $form->getExtraData())
                )
            );
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }

    /**
     * @param array<string, mixed> $values
     */
    protected function linkProposalAuthorToResponses(Author $author, array &$values): void
    {
        $contributorKey = $author instanceof Participant ? 'participant' : 'user';

        if (isset($values['responses'])) {
            foreach ($values['responses'] as $key => $ignored) {
                $values['responses'][$key][$contributorKey] = $author->getId();
            }
        }
    }

    private function canContributeToStep(ContributorInterface $contributor, ProposalForm $proposalForm): bool
    {
        return match (true) {
            $contributor instanceof Participant => $proposalForm->getStep()?->isOpen() ?? false,
            $contributor instanceof User => $proposalForm->canContribute($contributor) || $contributor->isAdmin(),
            default => false,
        };
    }

    private function getShouldTriggerWorkflow(ProposalForm $proposalForm, ContributorInterface $contributor): bool
    {
        $consentInternalCommunication = $contributor->isConsentInternalCommunication();
        $username = $contributor->getUsername();
        $proposalCount = $this->proposalRepository->getProposalCountByStepAndContributor($proposalForm->getStep(), $contributor);

        return (!$consentInternalCommunication || !$username) && 1 === $proposalCount;
    }
}
