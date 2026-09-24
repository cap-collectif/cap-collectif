<?php

namespace Capco\AppBundle\GraphQL\Mutation\Video;

use Capco\AppBundle\Entity\Video;
use Capco\AppBundle\Enum\VideoErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\VideoRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateVideoMutation implements MutationInterface
{
    use MutationTrait;
    use VideoTranslationsTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly VideoRepository $videoRepository,
        private readonly UserRepository $userRepository,
        private readonly MediaRepository $mediaRepository,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    /**
     * @return array{video?: Video|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $video = $this->videoRepository->find($input->offsetGet('id'));
        if (!$video instanceof Video) {
            return ['video' => null, 'errorCode' => VideoErrorCode::NOT_FOUND];
        }

        $link = trim((string) $input->offsetGet('link'));
        if ('' === $link) {
            return ['video' => null, 'errorCode' => VideoErrorCode::LINK_REQUIRED];
        }

        $translations = $input->offsetGet('translations') ?? [];
        if (!$this->hasValidTranslations($translations, $this->localeRepository->getDefaultCode())) {
            return ['video' => null, 'errorCode' => VideoErrorCode::TITLE_REQUIRED];
        }

        $this->applyTranslations($video, $translations);
        $video->setLink($link);
        $video->setIsEnabled((bool) ($input->offsetGet('isEnabled') ?? $video->getIsEnabled()));
        $video->setPosition((int) ($input->offsetGet('position') ?? $video->getPosition()));
        $this->applyAuthorAndMedia($video, $input, $this->userRepository, $this->mediaRepository);

        $this->em->flush();

        return ['video' => $video, 'errorCode' => null];
    }
}
