<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;

class MediaAccessResolver
{
    public const PRIVATE_ATTACHMENT = 'private_attachment';

    public function __construct(
        private readonly MediaResponseRepository $responseRepository,
        private readonly QuestionnaireResultsAccessResolver $replyAccess
    ) {
    }

    public function canView(Media $media, ?User $viewer = null, ?\ArrayObject $context = null, ?ResolveInfo $info = null): bool
    {
        if ($viewer?->isAdmin() || true === ($context['disable_acl'] ?? false)) {
            return true;
        }

        $private = '1' === $media->getMetadataValue(self::PRIVATE_ATTACHMENT);
        foreach ($this->responseRepository->findByMedia($media) as $response) {
            if (!self::isPrivateResponse($response)) {
                continue;
            }
            $private = true;
            if ($this->replyAccess->canViewResponse($response, $viewer, $context, $info)) {
                return true;
            }
        }

        // Removing an answer must never publish its former attachments.
        return !$private;
    }

    public function isPrivate(Media $media): bool
    {
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

    public static function isPrivateResponse(MediaResponse $response): bool
    {
        return null !== $response->getReply()
            || null !== $response->getAnalysis()
            || $response->getQuestion()->isPrivate()
            || $response->getQuestion()->getHidden();
    }
}
