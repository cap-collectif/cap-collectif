<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Type\Definition\ResolveInfo;

class MediaAccessResolver
{
    public const PRIVATE_ATTACHMENT = 'private_attachment';

    public function __construct(
        private readonly MediaResponseRepository $responseRepository,
        private readonly QuestionnaireResultsAccessResolver $replyAccess,
        private readonly EntityManagerInterface $em,
        private readonly MediaHtmlReferences $html,
        private readonly PrivateMediaUpload $uploads
    ) {}

    public function canView(Media $media, ?User $viewer = null, ?\ArrayObject $context = null, ?ResolveInfo $info = null): bool
    {
        if ($viewer?->isAdmin() || true === ($context['disable_acl'] ?? false)) {
            return true;
        }

        if (Media::VOCAL_CONTRIBUTION_CONTEXT === $media->getContext()) {
            return false;
        }

        $attached = false;
        $private = '1' === $media->getMetadataValue(self::PRIVATE_ATTACHMENT);
        foreach ($this->responseRepository->findByMedia($media) as $response) {
            $attached = true;
            if (!self::isPrivateResponse($response)) {
                continue;
            }
            $private = true;
            if ($this->replyAccess->canViewResponse($response, $viewer, $context, $info)) {
                return true;
            }
        }

        foreach ($this->em->getRepository(ValueResponse::class)->findByIdsWithReply($media->getProviderMetadata()['private_html_responses'] ?? []) as $response) {
            if (!\is_string($response->getValue())) {
                continue;
            }
            $attached = true;
            foreach ($this->html->references($response->getValue()) as $reference) {
                if ($reference->getId() === $media->getId() && $this->replyAccess->canViewResponse($response, $viewer, $context, $info)) {
                    return true;
                }
            }
        }

        // Removing an answer must never publish its former attachments.
        return !$private || (!$attached && $this->uploads->ownsPending($media));
    }

    public function isPrivate(Media $media): bool
    {
        if (Media::VOCAL_CONTRIBUTION_CONTEXT === $media->getContext()) {
            return true;
        }

        if ('1' === $media->getMetadataValue(self::PRIVATE_ATTACHMENT)) {
            return true;
        }
        foreach ($this->responseRepository->findByMedia($media) as $response) {
            if (self::isPrivateResponse($response)) {
                return true;
            }
        }

        return false;
    }

    public static function isPrivateResponse(AbstractResponse $response): bool
    {
        return null !== $response->getReply()
            || null !== $response->getProposalEvaluation()
            || null !== $response->getAnalysis()
            || $response->getQuestion()->isPrivate()
            || $response->getQuestion()->getHidden();
    }
}
