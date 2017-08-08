<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Form\ProposalProgressStepType;
use Capco\AppBundle\Form\ProposalType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;

class ProposalMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function updateProgressSteps(Argument $values): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $values = $input->getRawArguments();
        $proposal = $em->find('CapcoAppBundle:Proposal', $values['id']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%d"', $values['id']));
        }
        unset($values['id']); // This only usefull to retrieve the proposal

      $form = $formFactory->create(ProposalProgressStepType::class, $proposal);
        $form->submit($values);

        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        $em->flush();

        return ['proposal' => $proposal];
    }

    public function updateCollectStatus(string $proposalId, $statusId = null): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $proposal = $em->find('CapcoAppBundle:Proposal', $proposalId);
        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        $status = null;
        if ($statusId) {
            $status = $em->getRepository('CapcoAppBundle:Status')->find($statusId);
        }

        $proposal->setStatus($status);
        $em->flush();

        $this->container->get('capco.notify_manager')->notifyProposalStatusChangeInCollect($proposal);

        return ['proposal' => $proposal];
    }

    public function updateSelectionStatus(string $proposalId, string $stepId, $statusId = null): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $selection = $em->getRepository('CapcoAppBundle:Selection')->findOneBy([
          'proposal' => $proposalId,
          'selectionStep' => $stepId,
        ]);

        if (!$selection) {
            throw new UserError('Cant find the selection');
        }

        $status = null;
        if ($statusId) {
            $status = $em->getRepository('CapcoAppBundle:Status')->find($statusId);
        }

        $selection->setStatus($status);
        $em->flush();

        $this->container->get('capco.notify_manager')->notifyProposalStatusChangeInSelection($selection);

        $proposal = $em->find('CapcoAppBundle:Proposal', $proposalId);

        return ['proposal' => $proposal];
    }

    public function unselectProposal(string $proposalId, string $stepId): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $selection = $em->getRepository('CapcoAppBundle:Selection')
                      ->findOneBy(['proposal' => $proposalId, 'selectionStep' => $stepId]);

        if (!$selection) {
            throw new UserError('Cant find the selection');
        }
        $em->remove($selection);
        $em->flush();

        $proposal = $em->find('CapcoAppBundle:Proposal', $proposalId);

        return ['proposal' => $proposal];
    }

    public function selectProposal(string $proposalId, string $stepId): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $selection = $em->getRepository('CapcoAppBundle:Selection')
                      ->findOneBy(['proposal' => $proposalId, 'selectionStep' => $stepId]);
        if ($selection) {
            throw new UserError('Already selected');
        }

        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->find($proposalId);
        $step = $em->getRepository('CapcoAppBundle:Steps\SelectionStep')->find($stepId);

        $selection = new Selection();
        $selection->setSelectionStep($step);
        $proposal->addSelection($selection);

        $em->persist($selection);
        $em->flush();

        return ['proposal' => $proposal];
    }

    public function changePublicationStatus(Argument $values): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');

        $proposal = $em->find('CapcoAppBundle:Proposal', $values['id']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%d"', $values['id']));
        }

        $proposal->setExpired(false);
        $proposal->setEnabled(true);
        $proposal->setTrashed(true);

        try {
            $em->flush();
        } catch (\Exception $e) {
            throw new UserError('Error sorry');
        }

        return ['proposal' => $proposal];
    }

    public function changeContent(Argument $input, Request $request): array
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $logger = $this->container->get('logger');
        $formFactory = $this->container->get('form.factory');
        $mediaManager = $this->container->get('capco.media.manager');

        $values = $input->getRawArguments();
        $proposal = $em->find('CapcoAppBundle:Proposal', $values['id']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%d"', $values['id']));
        }
        // if (!$proposal->canContribute()) {
        //     throw new UserError('This proposal is no longer editable.');
        // }

        // if ($this->getUser() !== $proposal->getAuthor()) {
        //     throw new UserError('You can not update');
        // }

        unset($values['id']); // This only usefull to retrieve the proposal

        // Handle media deletion
        if ($values['deleteCurrentMedia'] === true) {
            if ($proposal->getMedia()) {
                $em->remove($proposal->getMedia());
                $proposal->setMedia(null);
            }
        }
        unset($values['deleteCurrentMedia']);

        // Handle File upload for key `media`
        $uploadedMedia = $request->files->get('media');
        if ($uploadedMedia instanceof UploadedFile) {
            $logger->info('UploadedMedia:' . $uploadedMedia->getClientOriginalName());
            if ($proposal->getMedia()) {
                $em->remove($proposal->getMedia());
            }
            $media = $mediaManager->createFileFromUploadedFile($uploadedMedia);
            $proposal->setMedia($media);
            // $em->flush();
            $request->files->remove('media');
        }

        // Now we handle file uploads for every responses
        foreach ($request->files->all() as $key => $file) {
            $questionId = str_replace('responses.', '', $key);
            $response = $proposal->getResponses()->filter(
                  function (AbstractResponse $element) use ($questionId) {
                      return (int) $element->getQuestion()->getId() === (int) $questionId;
                  }
              )->first();
            if (!$response) {
                throw new UserError(sprintf('Unknown response for question with id "%d"', $questionId));
            }
            $media = $mediaManager->createFileFromUploadedFile($uploadedMedia);
            $response->addMedia($media);
        }

       // Now we can submit the form without anything related to file uploads
       $form = $formFactory->create(ProposalType::class, $proposal, [
           'proposalForm' => $proposal->getProposalForm(),
       ]);

        $form->submit($values);
        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        // $em->persist($proposal);
        $em->flush();

        return ['proposal' => $proposal];
    }
}
