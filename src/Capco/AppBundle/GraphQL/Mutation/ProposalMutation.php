<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Form\ProposalType;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\Request;

class ProposalMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function changePublicationStatus(Argument $values)
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

    public function changeContent(Argument $input, Request $request)
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        $formFactory = $this->container->get('form.factory');

        $proposal = $em->find('CapcoAppBundle:Proposal', $input['id']);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%d"', $input['id']));
        }

        // if ($uploadedMedia = $request->files->get('media')) {
        //     $media = $this->container->get('capco.media.manager')->createFileFromUploadedFile($uploadedMedia);
        //     $proposal->setMedia($media);
        //     $request->files->remove('media');
        // }
        //
        // $request->files->remove('media');
        // $request->request->remove('media');
        // $request->request->remove('delete_media');
        //
        // if (count($request->files->all()) > 0) {
        //     $this->container->get('capco.media.response.media.manager')->updateMediasFromRequest($proposal, $request);
        //     $em->persist($proposal);
        //     $em->flush();
        // }

      // if (!$proposal->canContribute()) {
      //     throw new UserError('This proposal is no longer editable.');
      // }

      // if ($this->getUser() !== $proposal->getAuthor()) {
      //     throw new UserError('You can not update');
      // }

       $form = $formFactory->create(ProposalType::class, $proposal, [
           'proposalForm' => $proposal->getProposalForm(),
       ]);

        $logger = $this->container->get('logger');
        $values = $input->getRawArguments();
        unset($values['id']);

        $logger->info(json_encode($values));

        $form->submit($values);
        if (!$form->isValid()) {
            throw new UserError('Input not valid : ' . (string) $form->getErrors(true, false));
        }

        $em->persist($proposal);
        $em->flush();

        return ['proposal' => $proposal];
    }
}
