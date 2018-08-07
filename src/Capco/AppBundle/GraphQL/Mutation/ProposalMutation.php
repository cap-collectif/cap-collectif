<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Swarrot\Broker\Message;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Form\ProposalType;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalAdminType;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Error\UserErrors;
use Capco\AppBundle\Form\ProposalEvaluersType;
use Capco\AppBundle\Form\ProposalNotationType;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\Form\ProposalProgressStepType;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

class ProposalMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function changeNotation(Argument $input)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $values = $input->getRawArguments();
        $proposal = $this->container->get('capco.proposal.repository')->find($values['proposalId']);
        unset($values['proposalId']); // This only usefull to retrieve the proposal

        $form = $formFactory->create(ProposalNotationType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        $em->flush();

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
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
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
        unset($values['proposalId']); // This only usefull to retrieve the proposal

        $form = $formFactory->create(ProposalProgressStepType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
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
        $indexer = $this->container->get('capco.elasticsearch.indexer');
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
        $indexer = $this->container->get('capco.elasticsearch.indexer');
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
        $indexer = $this->container->get('capco.elasticsearch.indexer');
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
        $indexer = $this->container->get('capco.elasticsearch.indexer');
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function changePublicationStatus(Argument $values, User $user): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        if ($user && $user->isAdmin()) {
            // If user is an admin, we allow to retrieve deleted proposal
            if ($em->getFilters()->isEnabled('softdeleted')) {
                $em->getFilters()->disable('softdeleted');
            }
        }
        $proposal = $this->getProposal($values['proposalId']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $values['proposalId']));
        }

        switch ($values['publicationStatus']) {
            case 'TRASHED':
                $proposal
                    ->setTrashedStatus(Trashable::STATUS_VISIBLE)
                    ->setTrashedReason($values['trashedReason'])
                    ->setDeletedAt(null);
                break;
            case 'PUBLISHED':
                $proposal
                    ->setPublishedAt(new \DateTime())
                    ->setDraft(false)
                    ->setTrashedStatus(null)
                    ->setDeletedAt(null);
                break;
            case 'TRASHED_NOT_VISIBLE':
                $proposal
                    ->setTrashedStatus(Trashable::STATUS_INVISIBLE)
                    ->setTrashedReason($values['trashedReason'])
                    ->setDeletedAt(null);
                break;
            case 'DRAFT':
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
        $indexer = $this->container->get('capco.elasticsearch.indexer');
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    public function create(Argument $input, User $user): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $logger = $this->container->get('logger');
        $formFactory = $this->container->get('form.factory');
        $proposalFormRepo = $this->container->get('capco.proposal_form.repository');

        $values = $input->getRawArguments();

        $proposalForm = $proposalFormRepo->find($values['proposalFormId']);
        if (!$proposalForm) {
            $error = sprintf('Unknown proposalForm with id "%s"', $values['proposalFormId']);
            $logger->error($error);
            throw new UserError($error);
        }
        if (!$proposalForm->canContribute() && !$user->isAdmin()) {
            throw new UserError('You can no longer contribute to this collect step.');
        }
        unset($values['proposalFormId']); // This only usefull to retrieve the proposalForm

        $draft = false;
        if (array_key_exists('draft', $values)) {
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
            $defaultStatus = $proposalForm->getStep()->getDefaultStatus()
        ) {
            $proposal->setStatus($defaultStatus);
        }

        $form = $formFactory->create(ProposalType::class, $proposal, [
            'proposalForm' => $proposalForm,
            'validation_groups' => [$draft ? 'ProposalDraft' : 'Default'],
        ]);

        $logger->info('createProposal: ' . json_encode($values, true));
        $form->submit($values);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }

        $em->persist($follower);
        $em->persist($proposal);
        $em->flush();

        $this->container->get('redis_storage.helper')->recomputeUserCounters($user);

        // Synchronously index
        $indexer = $this->container->get('capco.elasticsearch.indexer');
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        $this->container->get('swarrot.publisher')->publish(
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
        $logger = $this->container->get('logger');

        $values = $input->getRawArguments();
        $proposal = $proposalRepo->find($values['id']);

        if (!$proposal) {
            $error = sprintf('Unknown proposal with id "%s"', $values['id']);
            $logger->error($error);
            throw new UserError($error);
        }
        unset($values['id']); // This only usefull to retrieve the proposal
        $proposalForm = $proposal->getProposalForm();

        if ($user !== $proposal->getAuthor() && !$user->isAdmin()) {
            $error = sprintf('You must be the author to update a proposal.');
            $logger->error($error);
            throw new UserError($error);
        }

        if (!$proposal->canContribute() && !$user->isAdmin()) {
            $error = sprintf('Sorry, you can\'t contribute to this proposal anymore.');
            $logger->error($error);
            throw new UserError($error);
        }

        $draft = false;
        if (array_key_exists('draft', $values)) {
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
            if (array_key_exists('author', $values)) {
                $error = 'Only a user with role ROLE_SUPER_ADMIN can update an author.';
                $logger->error($error);
                // For now we only log an error and unset the submitted value…
                unset($values['author']);
            }
            $form->remove('author');
        }

        $logger->info('changeContent: ' . json_encode($values, true));
        $form->submit($values, false);

        if (!$form->isValid()) {
            $this->handleErrors($form);
        }

        $proposal->setUpdateAuthor($user);
        $em->flush();

        $this->container->get('swarrot.publisher')->publish(
            CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE,
            new Message(json_encode(['proposalId' => $proposal->getId()]))
        );

        // Synchronously index draft proposals being publish
        $indexer = $this->container->get('capco.elasticsearch.indexer');
        $indexer->index(\get_class($proposal), $proposal->getId());
        $indexer->finishBulk();

        return ['proposal' => $proposal];
    }

    private function fixValues(array $values, ProposalForm $proposalForm)
    {
        $toggleManager = $this->container->get('capco.toggle.manager');

        if (
            (!$toggleManager->isActive('themes') || !$proposalForm->isUsingThemes()) &&
            array_key_exists('theme', $values)
        ) {
            unset($values['theme']);
        }

        if (!$proposalForm->isUsingCategories() && array_key_exists('category', $values)) {
            unset($values['category']);
        }

        if (
            (!$toggleManager->isActive('districts') || !$proposalForm->isUsingDistrict()) &&
            array_key_exists('district', $values)
        ) {
            unset($values['district']);
        }

        if (!$proposalForm->getUsingAddress() && array_key_exists('address', $values)) {
            unset($values['address']);
        }

        if (isset($values['responses'])) {
            $values['responses'] = $this->container->get('responses.formatter')->format(
                $values['responses']
            );
        }

        return $values;
    }

    private function handleErrors($form)
    {
        $logger = $this->container->get('logger');
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $logger->error((string) $error->getMessage());
            $logger->error('Extra data: ' . implode($form->getExtraData()));
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
