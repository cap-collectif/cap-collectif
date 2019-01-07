<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalLikersDataLoader;
use Elastica\Index;
use Swarrot\Broker\Message;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\Form;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Form\ProposalType;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Form\ProposalAdminType;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Capco\AppBundle\Form\ProposalEvaluersType;
use Capco\AppBundle\Form\ProposalNotationType;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Form\ProposalProgressStepType;
use Capco\AppBundle\Enum\ProposalPublicationStatus;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class ProposalMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;
    private $logger;
    private $proposalLikersDataLoader;

    public function __construct(
        LoggerInterface $logger,
        ProposalLikersDataLoader $proposalLikersDataLoader
    ) {
        $this->logger = $logger;
        $this->proposalLikersDataLoader = $proposalLikersDataLoader;
    }

    public function changeNotation(Argument $input)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $values = $input->getRawArguments();
        $proposal = $this->container->get('capco.proposal.repository')->find($values['proposalId']);
        unset($values['proposalId']); // This only useful to retrieve the proposal

        $form = $formFactory->create(ProposalNotationType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $em->flush();
        $this->proposalLikersDataLoader->invalidate($proposal);

        return ['proposal' => $proposal];
    }

    public function changeEvaluers(Argument $input)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $values = $input->getRawArguments();
        $proposal = $this->container->get('capco.proposal.repository')->find($values['proposalId']);
        unset($values['proposalId']);

        $form = $formFactory->create(ProposalEvaluersType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $em->flush();

        return ['proposal' => $proposal];
    }

    public function changeFollowers(string $proposalId, User $user)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $proposal = $this->getProposal($proposalId);

        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        $proposal->addFollower($user);
        $em->flush();

        return ['proposal' => $proposal];
    }

    public function changeProgressSteps(Argument $input): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $values = $input->getRawArguments();
        $proposal = $this->getProposal($values['proposalId']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $values['proposalId']));
        }
        unset($values['proposalId']); // This only useful to retrieve the proposal

        $form = $formFactory->create(ProposalProgressStepType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . $form->getErrors(true, false));
        }

        $em->flush();

        return ['proposal' => $proposal];
    }

    public function changeCollectStatus(string $proposalId, string $statusId = null): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $proposal = $this->getProposal($proposalId);
        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        $status = null;
        if ($statusId) {
            $status = $this->container->get('capco.status.repository')->find($statusId);
        }

        $proposal->setStatus($status);
        $em->flush();

        // Synchronously index
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function changeSelectionStatus(
        string $proposalId,
        string $stepId,
        string $statusId = null
    ): array {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $selection = $this->container->get('capco.selection.repository')->findOneBy([
            'proposal' => $proposalId,
            'selectionStep' => $stepId,
        ]);

        if (!$selection) {
            throw new UserError('Cant find the selection');
        }

        $status = null;
        if ($statusId) {
            $status = $this->container->get('capco.status.repository')->find($statusId);
        }

        $selection->setStatus($status);
        $em->flush();

        $proposal = $this->getProposal($proposalId);

        // Synchronously index
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function unselectProposal(string $proposalId, string $stepId): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $selection = $this->container->get('capco.selection.repository')->findOneBy([
            'proposal' => $proposalId,
            'selectionStep' => $stepId,
        ]);

        if (!$selection) {
            throw new UserError('Cant find the selection');
        }
        $em->remove($selection);
        $em->flush();

        $proposal = $this->getProposal($proposalId);

        // Synchronously index
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function selectProposal(
        string $proposalId,
        string $stepId,
        string $statusId = null
    ): array {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $selection = $this->container->get('capco.selection.repository')->findOneBy([
            'proposal' => $proposalId,
            'selectionStep' => $stepId,
        ]);
        if ($selection) {
            throw new UserError('Already selected');
        }

        $selectionStatus = null;

        if ($statusId) {
            $selectionStatus = $this->container->get('capco.status.repository')->find($statusId);
        }

        $proposal = $this->getProposal($proposalId);
        $step = $this->container->get('capco.selection_step.repository')->find($stepId);

        $selection = new Selection();
        $selection->setSelectionStep($step);
        $selection->setStatus($selectionStatus);
        $proposal->addSelection($selection);

        $em->persist($selection);
        $em->flush();

        // Synchronously index
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function changePublicationStatus(Argument $values, User $user): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        if ($user && $user->isAdmin() && $em->getFilters()->isEnabled('softdeleted')) {
            // If user is an admin, we allow to retrieve deleted proposal
            $em->getFilters()->disable('softdeleted');
        }
        $proposal = $this->getProposal($values['proposalId']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $values['proposalId']));
        }

        switch ($values['publicationStatus']) {
            case ProposalPublicationStatus::TRASHED:
                $proposal
                    ->setTrashedStatus(Trashable::STATUS_VISIBLE)
                    ->setTrashedReason($values['trashedReason'])
                    ->setDeletedAt(null);

                break;
            case ProposalPublicationStatus::PUBLISHED:
                $proposal
                    ->setPublishedAt(new \DateTime())
                    ->setDraft(false)
                    ->setTrashedStatus(null)
                    ->setDeletedAt(null);

                break;
            case ProposalPublicationStatus::TRASHED_NOT_VISIBLE:
                $proposal
                    ->setTrashedStatus(Trashable::STATUS_INVISIBLE)
                    ->setTrashedReason($values['trashedReason'])
                    ->setDeletedAt(null);

                break;
            case ProposalPublicationStatus::DRAFT:
                $proposal
                    ->setDraft(true)
                    ->setTrashedStatus(null)
                    ->setDeletedAt(null);

                break;
            default:
                break;
        }

        $em->flush();

        // Synchronously index
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function create(Argument $input, User $user): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');
        $proposalFormRepo = $this->container->get('capco.proposal_form.repository');

        $values = $input->getRawArguments();

        /** @var ProposalForm $proposalForm */
        $proposalForm = $proposalFormRepo->find($values['proposalFormId']);
        if (!$proposalForm) {
            $error = sprintf('Unknown proposalForm with id "%s"', $values['proposalFormId']);
            $this->logger->error($error);

            throw new UserError($error);
        }
        if (!$proposalForm->canContribute($user) && !$user->isAdmin()) {
            throw new UserError('You can no longer contribute to this collect step.');
        }
        unset($values['proposalFormId']); // This only useful to retrieve the proposalForm

        $draft = false;
        if (isset($values['draft'])) {
            $draft = $values['draft'];
            unset($values['draft']);
        }

        $values = $this->fixValues($values, $proposalForm);
        $proposal = new Proposal();
        $follower = new Follower();
        $follower->setUser($user);
        $follower->setProposal($proposal);
        $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);

        $proposal
            ->setDraft($draft)
            ->setAuthor($user)
            ->setProposalForm($proposalForm)
            ->addFollower($follower);
        if (
            $proposalForm->getStep() &&
            ($defaultStatus = $proposalForm->getStep()->getDefaultStatus())
        ) {
            $proposal->setStatus($defaultStatus);
        }

        $form = $formFactory->create(ProposalType::class, $proposal, [
            'proposalForm' => $proposalForm,
            'validation_groups' => [$draft ? 'ProposalDraft' : 'Default'],
        ]);

        $this->logger->info('createProposal: ' . json_encode($values, true));
        $form->submit($values);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }

        $em->persist($follower);
        $em->persist($proposal);
        $em->flush();

        $this->container->get('redis_storage.helper')->recomputeUserCounters($user);

        // Synchronously index
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        $this->container->get(ProposalFormProposalsDataLoader::class)->invalidate($proposalForm);

        $this->container
            ->get('swarrot.publisher')
            ->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_CREATE,
                new Message(json_encode(['proposalId' => $proposal->getId()]))
            );

        return ['proposal' => $proposal];
    }

    public function changeContent(Argument $input, User $user): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');
        $proposalRepo = $this->container->get('capco.proposal.repository');

        $values = $input->getRawArguments();
        $proposal = $proposalRepo->find($values['id']);
        // Save the previous draft status to send the good notif.
        $wasDraft = $proposal->isDraft();

        if (!$proposal) {
            $error = sprintf('Unknown proposal with id "%s"', $values['id']);
            $this->logger->error($error);

            throw new UserError($error);
        }
        unset($values['id']); // This only useful to retrieve the proposal
        $proposalForm = $proposal->getProposalForm();

        if ($user !== $proposal->getAuthor() && !$user->isAdmin()) {
            $error = sprintf('You must be the author to update a proposal.');
            $this->logger->error($error);

            throw new UserError($error);
        }

        if (!$proposal->canContribute($user) && !$user->isAdmin()) {
            $error = sprintf('Sorry, you can\'t contribute to this proposal anymore.');
            $this->logger->error($error);

            throw new UserError($error);
        }

        $draft = false;
        if (isset($values['draft'])) {
            if ($proposal->isDraft()) {
                $draft = $values['draft'];
            }
            unset($values['draft']);
        }

        $proposal->setDraft($draft);

        $values = $this->fixValues($values, $proposalForm);

        $form = $formFactory->create(ProposalAdminType::class, $proposal, [
            'proposalForm' => $proposalForm,
            'validation_groups' => [$draft ? 'ProposalDraft' : 'Default'],
        ]);

        if (!$user->isSuperAdmin()) {
            if (isset($values['author'])) {
                $error = 'Only a user with role ROLE_SUPER_ADMIN can update an author.';
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

        $proposal->setUpdateAuthor($user);
        $em->flush();

        if ($wasDraft && !$proposal->isDraft()) {
            $proposalQueue = CapcoAppBundleMessagesTypes::PROPOSAL_CREATE;
        } else {
            $proposalQueue = CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE;
        }

        $this->container
            ->get('swarrot.publisher')
            ->publish(
                $proposalQueue,
                new Message(json_encode(['proposalId' => $proposal->getId()]))
            );

        // Synchronously index draft proposals being publish
        $indexer = $this->container->get(Indexer::class);
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    private function fixValues(array $values, ProposalForm $proposalForm)
    {
        $toggleManager = $this->container->get(Manager::class);

        if (
            isset($values['theme']) &&
            (!$toggleManager->isActive('themes') || !$proposalForm->isUsingThemes())
        ) {
            unset($values['theme']);
        }

        if (isset($values['category']) && !$proposalForm->isUsingCategories()) {
            unset($values['category']);
        }

        if (
            isset($values['districts']) &&
            (!$toggleManager->isActive('districts') || !$proposalForm->isUsingDistrict())
        ) {
            unset($values['district']);
        }

        if (isset($values['address']) && !$proposalForm->getUsingAddress()) {
            unset($values['address']);
        }

        if (isset($values['responses'])) {
            $values['responses'] = $this->container
                ->get(ResponsesFormatter::class)
                ->format($values['responses']);
        }

        return $values;
    }

    private function handleErrors(Form $form)
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $this->logger->error(__METHOD__ . ' : ' . $error->getMessage());
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    $form->getName() .
                    ' ' .
                    'Extra data: ' .
                    implode('', $form->getExtraData())
            );
            $errors[] = (string) $error->getMessage();
        }
        if (!empty($errors)) {
            throw new UserErrors($errors);
        }
    }

    private function getProposal(string $proposalId): Proposal
    {
        return $this->container->get('capco.proposal.repository')->find($proposalId);
    }
}
