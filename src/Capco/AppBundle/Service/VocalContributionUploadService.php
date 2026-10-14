<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Exception\VocalContributionUploadException;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Toggle\Manager as ToggleManager;
use Capco\AppBundle\Validator\Constraints\MaxVocalFolderSize;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class VocalContributionUploadService
{
    private const MIN_DURATION = 10;
    private const MAX_DURATION = 180;
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;
    // The browser measures the duration with a clock: the encoded audio may differ by a few hundredths
    private const DURATION_TOLERANCE = 1;
    private const ALLOWED_AUDIO_MIME_TYPES = [
        'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a',
    ];
    // The content is sniffed: an audio-only WebM or MP4 recorded by a browser is detected as video/*,
    // so video streams are rejected by VocalContributionDurationResolver instead
    private const ALLOWED_SNIFFED_MIME_TYPES = [
        ...self::ALLOWED_AUDIO_MIME_TYPES, 'video/webm', 'video/mp4',
    ];

    public function __construct(
        private readonly MediaManager $mediaManager,
        private readonly MediaProvider $mediaProvider,
        private readonly EntityManagerInterface $entityManager,
        private readonly ParticipantHelper $participantHelper,
        private readonly ToggleManager $toggleManager,
        private readonly VocalContributionDurationResolver $durationResolver,
        private readonly CollectStepRepository $collectStepRepository,
        private readonly string $mediaSizeLimit
    ) {
    }

    public function upload(
        UploadedFile $file,
        ?User $user,
        ?string $participantToken
    ): VocalContribution {
        if (!$this->toggleManager->isActive(ToggleManager::vocal_contribution)) {
            throw new VocalContributionUploadException('VOCAL_CONTRIBUTION_DISABLED', Response::HTTP_FORBIDDEN);
        }

        $fileSize = $file->getSize();
        if (\in_array($file->getError(), [\UPLOAD_ERR_INI_SIZE, \UPLOAD_ERR_FORM_SIZE], true)
            || (null !== $fileSize && $fileSize > min($this->getMediaSizeLimitInBytes(), self::MAX_FILE_SIZE))) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_REQUEST_ENTITY_TOO_LARGE);
        }

        if (!$file->isValid() || null === $fileSize || 0 === $fileSize) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_BAD_REQUEST);
        }

        $mimeType = strtolower((string) $file->getMimeType());
        if (!\in_array($mimeType, self::ALLOWED_SNIFFED_MIME_TYPES, true)) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_UNSUPPORTED_MEDIA_TYPE);
        }

        try {
            $this->mediaManager->validateUploadedFile(
                $file,
                self::ALLOWED_SNIFFED_MIME_TYPES,
                new MaxVocalFolderSize()
            );
        } catch (\RuntimeException) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_BAD_REQUEST);
        }

        $duration = $this->durationResolver->getDuration($file);
        if (null === $duration && !\in_array($mimeType, self::ALLOWED_AUDIO_MIME_TYPES, true)) {
            // The probe timed out: a video/* container cannot be trusted to be audio-only
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (null !== $duration && ($duration < self::MIN_DURATION - self::DURATION_TOLERANCE || $duration > self::MAX_DURATION + self::DURATION_TOLERANCE)) {
            throw new VocalContributionUploadException('INVALID_VOICE_DURATION', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (null === $this->collectStepRepository->findVocalContributionStep()) {
            throw new VocalContributionUploadException('VOCAL_CONTRIBUTION_NOT_CONFIGURED', Response::HTTP_NOT_FOUND);
        }

        $participant = $this->resolveParticipant($participantToken, $user);
        $extension = $file->guessExtension();
        if (null === $extension) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_BAD_REQUEST);
        }

        $upload = new UploadedFile($file->getPathname(), 'vocal-' . bin2hex(random_bytes(16)) . '.' . $extension);
        $media = null;
        $this->entityManager->getConnection()->beginTransaction();

        try {
            $media = $this->mediaManager->createFileFromUploadedFile(
                $upload,
                Media::VOCAL_CONTRIBUTION_CONTEXT,
                null,
                $user?->getUsername() ?? 'Anonyme',
                false
            );
            $media->setMetadataValue(MediaAccessResolver::PRIVATE_ATTACHMENT, '1');
            if (null !== $duration) {
                $media->setLength((int) round($duration));
            }
            $contribution = (new VocalContribution())->setMedia($media);
            if ($user) {
                $contribution->setUser($user);
            } elseif ($participant instanceof Participant) {
                $contribution->setParticipant($participant);
            }
            $this->entityManager->persist($contribution);
            $this->entityManager->flush();
            $this->entityManager->getConnection()->commit();

            return $contribution;
        } catch (\Throwable $exception) {
            $this->entityManager->getConnection()->rollBack();
            if ($media) {
                $this->mediaProvider->removePrivateVoiceMessageFile($media);
            }

            throw $exception;
        }
    }

    private function resolveParticipant(?string $token, ?User $user): ?Participant
    {
        if ($user) {
            return null;
        }

        if (null === $token) {
            return $this->participantHelper->getOrCreateParticipant();
        }

        try {
            return $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            throw new VocalContributionUploadException('INVALID_PARTICIPANT_TOKEN', Response::HTTP_BAD_REQUEST);
        }
    }

    private function getMediaSizeLimitInBytes(): int
    {
        if (1 !== preg_match('/^(\d+(?:\.\d+)?)\s*([kmgt]?)b?$/i', trim($this->mediaSizeLimit), $matches)) {
            return \PHP_INT_MAX;
        }

        $multiplier = match (strtolower($matches[2])) {
            'k' => 1024,
            'm' => 1024 ** 2,
            'g' => 1024 ** 3,
            't' => 1024 ** 4,
            default => 1,
        };

        return (int) ((float) $matches[1] * $multiplier);
    }
}
