<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\DBAL\Enum\ProposalRevisionStateType;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Entity\ProposalSocialNetworks;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Enum\ProposalPublicationStatus;
use Capco\AppBundle\Form\ProposalAdminType;
use Capco\AppBundle\Form\ProposalEvaluersType;
use Capco\AppBundle\Form\ProposalNotationType;
use Capco\AppBundle\Form\ProposalProgressStepType;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalLikersDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\SelectionRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use DateTime;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Form\Form;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProposalMutation extends CreateProposalMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;
    use MutationTrait;
    use ResolverTrait;

    public function __construct(
        LoggerInterface $logger,
        GlobalIdResolver $globalidResolver,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory,
        ProposalFormRepository $proposalFormRepository,
        RedisStorageHelper $redisStorageHelper,
        ProposalFormProposalsDataLoader $proposalFormProposalsDataLoader,
        Indexer $indexer,
        Manager $toggleManager,
        ResponsesFormatter $responsesFormatter,
        ProposalRepository $proposalRepository,
        Publisher $publisher,
        protected AuthorizationCheckerInterface $authorizationChecker,
        private readonly ProposalLikersDataLoader $proposalLikersDataLoader
    ) {
        parent::__construct(
            $logger,
            $globalidResolver,
            $em,
            $formFactory,
            $proposalFormRepository,
            $redisStorageHelper,
            $proposalFormProposalsDataLoader,
            $indexer,
            $toggleManager,
            $responsesFormatter,
            $proposalRepository,
            $publisher
        );
    }

    public function isGranted(string $id, ?User $viewer, string $accessType): bool
    {
        return $this->authorizationChecker->isGranted(
            $accessType,
            $this->getProposal($id, $viewer)
        );
    }

    public function isGrantedFusion(array $ids, ?User $viewer, string $accessType): bool
    {
        $proposals = array_map(fn ($id) => $this->getProposal($id, $viewer), $ids);

        return $this->authorizationChecker->isGranted($accessType, $proposals);
    }

    public function changeNotation(Argument $input, $user)
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();
        /** @var Proposal $proposal */
        $proposal = $this->globalIdResolver->resolve($values['proposalId'], $user);
        unset($values['proposalId']); // This only useful to retrieve the proposal

        foreach ($values['likers'] as &$userGlobalId) {
            $userGlobalId = GlobalIdResolver::getDecodedId($userGlobalId)['id'];
        }

        $form = $this->formFactory->create(ProposalNotationType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $this->em->flush();
        $this->proposalLikersDataLoader->invalidate($proposal);

        return ['proposal' => $proposal];
    }

    public function changeEvaluers(Argument $input, $user)
    {
        $values = $input->getArrayCopy();
        $proposal = $this->globalIdResolver->resolve($values['proposalId'], $user);

        unset($values['proposalId']);

        $form = $this->formFactory->create(ProposalEvaluersType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $this->em->flush();

        return ['proposal' => $proposal];
    }

    public function changeFollowers(string $proposalId, $user)
    {
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);

        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        $proposal->addFollower($user);
        $this->em->flush();

        return ['proposal' => $proposal];
    }

    public function changeProgressSteps(Argument $input, $user): array
    {
        $this->formatInput($input);
        $values = $input->getArrayCopy();
        /** @var Proposal $proposal */
        $proposal = $this->globalIdResolver->resolve($values['proposalId'], $user);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $values['proposalId']));
        }
        unset($values['proposalId']); // This only useful to retrieve the proposal

        $form = $this->formFactory->create(ProposalProgressStepType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $this->em->flush();
        $this->invalidateCache($proposal);

        return ['proposal' => $proposal];
    }

    public function changeCollectStatus(string $proposalId, $user, ?string $statusId = null): array
    {
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);
        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        $status = null;
        if ($statusId) {
            $status = $this->container->get(StatusRepository::class)->find($statusId);
        }
        $proposal->setStatus($status);
        $this->em->flush();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
            new Message(
                json_encode([
                    'proposalId' => $proposal->getId(),
                    'date' => new DateTime(),
                ])
            )
        );

        $this->invalidateCache($proposal);

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function changeSelectionStatus(
        string $proposalId,
        string $stepId,
        $user,
        ?string $statusId = null
    ): array {
        $proposalId = GlobalIdResolver::getDecodedId($proposalId);
        $stepId = GlobalIdResolver::getDecodedId($stepId);
        /** @var Selection $selection */
        $selection = $this->container->get(SelectionRepository::class)->findOneBy([
            'proposal' => \is_array($proposalId) ? $proposalId['id'] : $proposalId,
            'selectionStep' => \is_array($stepId) ? $stepId['id'] : $stepId,
        ]);

        if (!$selection) {
            throw new UserError('Cant find the selection');
        }

        $status = null;
        if ($statusId) {
            /** @var Status $status */
            $status = $this->container->get(StatusRepository::class)->find($statusId);
        }

        $selection->setStatus($status);
        $this->em->flush();

        $proposal = $this->globalIdResolver->resolve(
            \is_array($proposalId) ? $proposalId['id'] : $proposalId,
            $user
        );

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
            new Message(
                json_encode([
                    'proposalId' => $proposal->getId(),
                    'date' => new DateTime(),
                ])
            )
        );

        $this->invalidateCache($proposal);

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function unselectProposal(string $proposalId, string $stepId, $user): array
    {
        $proposalId = GlobalIdResolver::getDecodedId($proposalId);
        $stepId = GlobalIdResolver::getDecodedId($stepId);

        $selection = $this->container->get(SelectionRepository::class)->findOneBy([
            'proposal' => \is_array($proposalId) ? $proposalId['id'] : $proposalId,
            'selectionStep' => \is_array($stepId) ? $stepId['id'] : $stepId,
        ]);

        if (!$selection) {
            throw new UserError('Cant find the selection');
        }
        $this->em->remove($selection);
        $this->em->flush();

        $proposal = $this->globalIdResolver->resolve(
            \is_array($proposalId) ? $proposalId['id'] : $proposalId,
            $user
        );

        $this->invalidateCache($proposal);

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function selectProposal(
        string $proposalId,
        string $stepId,
        User $user,
        ?string $statusId = null
    ): array {
        $proposalId = GlobalIdResolver::getDecodedId($proposalId);
        $stepId = GlobalIdResolver::getDecodedId($stepId);

        $selection = $this->container->get(SelectionRepository::class)->findOneBy([
            'proposal' => \is_array($proposalId) ? $proposalId['id'] : $proposalId,
            'selectionStep' => \is_array($stepId) ? $stepId['id'] : $stepId,
        ]);
        if ($selection) {
            throw new UserError('Already selected');
        }

        $selectionStatus = null;

        if ($statusId) {
            $selectionStatus = $this->container->get(StatusRepository::class)->find($statusId);
        }

        $proposal = $this->globalIdResolver->resolve($proposalId['id'], $user);
        $step = $this->globalIdResolver->resolve($stepId['id'], $user);
        $selection = new Selection();
        $selection->setSelectionStep($step);
        $selection->setStatus($selectionStatus);
        $proposal->addSelection($selection);

        $this->em->persist($selection);
        $this->em->flush();

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
            new Message(
                json_encode([
                    'proposalId' => $proposal->getId(),
                    'date' => new DateTime(),
                ])
            )
        );

        $this->invalidateCache($proposal);

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function changePublicationStatus(Argument $values, $user): array
    {
        $this->formatInput($values);
        if ($user && $user->isAdmin() && $this->em->getFilters()->isEnabled('softdeleted')) {
            // If user is an admin, we allow to retrieve deleted proposal
            $this->em->getFilters()->disable('softdeleted');
        }
        /** @var Proposal $proposal */
        $proposal = $this->globalIdResolver->resolve($values['proposalId'], $user);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $values['proposalId']));
        }

        switch ($values['publicationStatus']) {
            case ProposalPublicationStatus::TRASHED:
                $proposal
                    ->setTrashedStatus(Trashable::STATUS_VISIBLE)
                    ->setTrashedReason($values['trashedReason'])
                    ->setDeletedAt(null)
                    ->setIsArchived(false)
                ;

                break;

            case ProposalPublicationStatus::PUBLISHED:
                $proposal
                    ->setPublishedAt(new DateTime())
                    ->setDraft(false)
                    ->setTrashedStatus(null)
                    ->setDeletedAt(null)
                    ->setIsArchived(false)
                ;

                break;

            case ProposalPublicationStatus::TRASHED_NOT_VISIBLE:
                $proposal
                    ->setTrashedStatus(Trashable::STATUS_INVISIBLE)
                    ->setTrashedReason($values['trashedReason'])
                    ->setDeletedAt(null)
                    ->setIsArchived(false)
                ;

                break;

            case ProposalPublicationStatus::DRAFT:
                $proposal
                    ->setDraft(true)
                    ->setTrashedStatus(null)
                    ->setDeletedAt(null)
                    ->setIsArchived(false)

                ;

                break;

            case ProposalPublicationStatus::ARCHIVED:
                $proposal
                    ->setIsArchived(true)
                ;

                break;

            default:
                break;
        }

        $this->em->flush();

        $this->invalidateCache($proposal);

        // Synchronously index
        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function changeContent(Argument $input, $viewer): array
    {
        $this->formatInput($input);
        $viewer = $this->preventNullableViewer($viewer);
        $values = $input->getArrayCopy();

        /** @var Proposal $proposal */
        $proposal = $this->globalIdResolver->resolve($values['id'], $viewer);
        if (!$proposal) {
            $error = sprintf('Unknown proposal with id "%s"', $values['id']);
            $this->logger->error($error);

            throw new UserError($error);
        }
        if (isset($values['likers'])) {
            foreach ($values['likers'] as &$userGlobalId) {
                $userGlobalId = GlobalIdResolver::getDecodedId($userGlobalId)['id'];
            }
        }

        // Save the previous draft status to send the good notif.
        $wasDraft = $proposal->isDraft();

        $proposalRevisionsEnabled = $this->toggleManager->isActive(Manager::proposal_revisions);
        // catch all revisions with state pending or expired
        $revisions = $proposalRevisionsEnabled
            ? $proposal
                ->getRevisions()
                ->filter(
                    fn (ProposalRevision $revision) => ProposalRevisionStateType::REVISED !==
                        $revision->getState()
                )
            : [];
        $wasInRevision = $proposalRevisionsEnabled && $proposal->isInRevision();

        $author = $proposal->getAuthor();

        unset($values['id']); // This only useful to retrieve the proposal
        $proposalForm = $proposal->getProposalForm();

        $draft = false;

        $this->shouldBeDraft($proposal, $author, $values, $wasDraft, $draft);

        $values = $this->fixValues($values, $proposalForm);
        $values = $this::hydrateSocialNetworks($values, $proposal, $proposalForm);

        /** @var Form $form */
        // delete field siret and rna from form ?
        $form = $this->formFactory->create(ProposalAdminType::class, $proposal, [
            'proposalForm' => $proposalForm,
            'validation_groups' => [$draft ? 'ProposalDraft' : 'Default'],
        ]);

        if (!$viewer->isAdmin()) {
            if (isset($values['author'])) {
                $error = 'Only a user with role ROLE_ADMIN can update an author.';
                $this->logger->error($error);
                // For now we only log an error and unset the submitted value…
                unset($values['author']);
            }
            $form->remove('author');
        }

        $this->logger->info(__METHOD__ . ' : ' . var_export($values, true));
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }
        $now = new DateTime();
        if ($viewer === $author) {
            $proposal->setUpdatedAt($now);

            if ($proposalRevisionsEnabled) {
                // set all revision (in pending or expired) with state revised
                /** @var ProposalRevision $revision */
                foreach ($revisions as $revision) {
                    $revision->setRevisedAt($now);
                    $revision->setState(ProposalRevisionStateType::REVISED);
                }
            }
        }

        $proposal->setUpdateAuthor($viewer);
        $this->em->flush();

        $messageData = ['proposalId' => $proposal->getId()];
        if ($wasDraft && !$proposal->isDraft()) {
            $proposalQueue = CapcoAppBundleMessagesTypes::PROPOSAL_CREATE;
            $sendNotification = true;
        } elseif ($wasInRevision) {
            $proposalQueue = CapcoAppBundleMessagesTypes::PROPOSAL_REVISION_REVISE;
            $messageData['date'] = $now->format('Y-m-d H:i:s');
            $sendNotification = true;
        } else {
            $sendNotification = !($proposal->viewerIsAdminOrOwner($viewer) && $author !== $viewer);
            $proposalQueue = CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE;
            $messageData['date'] = $proposal->getLastModifiedAt()
                ? $proposal->getLastModifiedAt()->format('Y-m-d H:i:s')
                : $now->format('Y-m-d H:i:s');
        }
        if ($sendNotification) {
            $this->publisher->publish($proposalQueue, new Message(json_encode($messageData)));
        }
        if (isset($values['likers'])) {
            $this->proposalLikersDataLoader->invalidate($proposal);
        }

        $this->invalidateCache($proposal);

        $this->indexer->index(ClassUtils::getClass($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    /** TODO use social networks validator */
    public static function hydrateSocialNetworks(
        array $values,
        Proposal $proposal,
        ProposalForm $proposalForm,
        bool $create = false,
        $unsetValue = true
    ): array {
        $socialNetworks =
            !$create && $proposal->getProposalSocialNetworks()
                ? $proposal->getProposalSocialNetworks()
                : (new ProposalSocialNetworks())->setProposal($proposal);

        $proposal->setProposalSocialNetworks($socialNetworks);
        if ($proposalForm->isUsingWebPage()) {
            if (empty($values['webPageUrl'])) {
                $socialNetworks->setWebPageUrl(null);
            } elseif (
                !empty($values['webPageUrl'])
                && filter_var($values['webPageUrl'], \FILTER_VALIDATE_URL)
            ) {
                $socialNetworks->setWebPageUrl($values['webPageUrl']);
            }
        }
        if ($proposalForm->isUsingFacebook()) {
            if (empty($values['facebookUrl'])) {
                $socialNetworks->setFacebookUrl(null);
            } elseif (
                !empty($values['facebookUrl'])
                && filter_var($values['facebookUrl'], \FILTER_VALIDATE_URL)
            ) {
                $socialNetworks->setFacebookUrl($values['facebookUrl']);
            }
        }
        if ($proposalForm->isUsingTwitter()) {
            if (empty($values['twitterUrl'])) {
                $socialNetworks->setTwitterUrl(null);
            } elseif (
                !empty($values['twitterUrl'])
                && filter_var($values['twitterUrl'], \FILTER_VALIDATE_URL)
            ) {
                $socialNetworks->setTwitterUrl($values['twitterUrl']);
            }
        }
        if ($proposalForm->isUsingInstagram()) {
            if (empty($values['instagramUrl'])) {
                $socialNetworks->setInstagramUrl(null);
            } elseif (
                !empty($values['instagramUrl'])
                && filter_var($values['instagramUrl'], \FILTER_VALIDATE_URL)
            ) {
                $socialNetworks->setInstagramUrl($values['instagramUrl']);
            }
        }
        if ($proposalForm->isUsingLinkedIn()) {
            if (empty($values['linkedInUrl'])) {
                $socialNetworks->setLinkedInUrl(null);
            } elseif (
                !empty($values['linkedInUrl'])
                && filter_var($values['linkedInUrl'], \FILTER_VALIDATE_URL)
            ) {
                $socialNetworks->setLinkedInUrl($values['linkedInUrl']);
            }
        }
        if ($proposalForm->isUsingYoutube()) {
            if (empty($values['youtubeUrl'])) {
                $socialNetworks->setYoutubeUrl(null);
            } elseif (
                !empty($values['youtubeUrl'])
                && filter_var($values['youtubeUrl'], \FILTER_VALIDATE_URL)
            ) {
                $socialNetworks->setYoutubeUrl($values['youtubeUrl']);
            }
        }

        if ($unsetValue) {
            unset(
                $values['webPageUrl'],
                $values['facebookUrl'],
                $values['twitterUrl'],
                $values['instagramUrl'],
                $values['linkedInUrl'],
                $values['youtubeUrl']
            );
        }

        return $values;
    }

    public function invalidateCache(Proposal $proposal): void
    {
        $cacheDriver = $this->em->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(ProposalRepository::getOneBySlugCacheKey($proposal->getSlug()));
    }

    private function shouldBeDraft(
        Proposal $proposal,
        User $author,
        array &$values,
        bool $wasDraft,
        bool &$draft
    ): void {
        if (isset($values['draft'])) {
            if ($wasDraft) {
                $draft = $values['draft'];
                if (!$draft) {
                    if ($author && $author->isEmailConfirmed()) {
                        $proposal->setPublishedAt(new DateTime());
                    }
                    $proposal->setDraft(false);
                }
            }
            unset($values['draft']);
        }
    }

    private function getProposal(string $id, ?User $viewer): ?Proposal
    {
        return $this->globalIdResolver->resolve($id, $viewer);
    }
}
