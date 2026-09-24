<?php

namespace Capco\AppBundle\GraphQL\Mutation\Video;

use Capco\AppBundle\Entity\Video;
use Capco\AppBundle\Enum\VideoErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateVideoMutation implements MutationInterface
{
    use MutationTrait;
    use VideoTranslationsTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
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

        $link = trim((string) $input->offsetGet('link'));
        if ('' === $link) {
            return ['video' => null, 'errorCode' => VideoErrorCode::LINK_REQUIRED];
        }

        $translations = $input->offsetGet('translations') ?? [];
        if (!$this->hasValidTranslations($translations, $this->localeRepository->getDefaultCode())) {
            return ['video' => null, 'errorCode' => VideoErrorCode::TITLE_REQUIRED];
        }

        $video = new Video();
        $this->applyTranslations($video, $translations);
        $video->setLink($link);
        $video->setIsEnabled((bool) ($input->offsetGet('isEnabled') ?? true));
        $video->setPosition((int) ($input->offsetGet('position') ?? 0));
        $this->applyAuthorAndMedia($video, $input, $this->userRepository, $this->mediaRepository);

        $this->em->persist($video);
        $this->em->flush();

        return ['video' => $video, 'errorCode' => null];
    }
}
