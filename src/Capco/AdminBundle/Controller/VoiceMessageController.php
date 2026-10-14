<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\VocalContributionFilenameResolver;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class VoiceMessageController extends AbstractController
{
    /**
     * @Route("/admin/voice-messages/{vocalId}/file", name="capco_admin_voice_message_file", methods={"GET"})
     */
    public function fileAction(string $vocalId, Request $request, Manager $toggleManager, MediaRepository $mediaRepository, MediaProvider $mediaProvider, VocalContributionRepository $vocalContributionRepository, VocalContributionFilenameResolver $filenameResolver): BinaryFileResponse
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        if (!$toggleManager->isActive(Manager::vocal_contribution)) {
            throw new AccessDeniedException();
        }
        $decodedId = GlobalId::fromGlobalId($vocalId);
        $vocalContribution = null;
        $media = null;

        if ('VocalContribution' === ($decodedId['type'] ?? null)) {
            $vocalContribution = $vocalContributionRepository->find($decodedId['id']);
            $media = $vocalContribution?->getMedia();
        } else {
            $mediaId = 'Media' === ($decodedId['type'] ?? null) ? $decodedId['id'] : $vocalId;
            $media = $mediaRepository->findOneBy(['id' => $mediaId, 'context' => Media::VOCAL_CONTRIBUTION_CONTEXT]);
        }

        if (!$media || !is_file($path = $mediaProvider->getPrivateVoiceMessagePath($media))) {
            throw $this->createNotFoundException();
        }

        $vocalContribution ??= $vocalContributionRepository->findOneBy(['media' => $media]);
        if (!$vocalContribution) {
            throw $this->createNotFoundException();
        }

        $filename = $filenameResolver->resolve($vocalContribution);
        $response = $this->file(
            $path,
            $filename,
            $request->query->getBoolean('download') ? ResponseHeaderBag::DISPOSITION_ATTACHMENT : ResponseHeaderBag::DISPOSITION_INLINE
        );
        $response->headers->set('Content-Type', $media->getContentType() ?? 'application/octet-stream');
        $response->headers->set('Cache-Control', 'private, no-store');
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        return $response;
    }

    /**
     * @Route("/admin/voice-messages", name="capco_admin_voice_messages", methods={"GET"})
     */
    public function indexAction(Manager $toggleManager): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        if (!$toggleManager->isActive(Manager::vocal_contribution)) {
            throw new AccessDeniedException();
        }

        return $this->redirect('/admin-next/voice-messages');
    }
}
