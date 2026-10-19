<?php

namespace Capco\AppBundle\GraphQL\Mutation\Theme;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateThemeMutation implements MutationInterface
{
    use MutationTrait;
    use ThemeInputTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
        private readonly MediaRepository $mediaRepository,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    /**
     * @return array{theme?: Theme|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $translations = $input->offsetGet('translations') ?? [];
        $errorCode = $this->validateTranslations($translations, $this->localeRepository->getDefaultCode());
        if ($errorCode) {
            return ['theme' => null, 'errorCode' => $errorCode];
        }

        $theme = new Theme();
        $this->applyTranslations($theme, $translations);
        $this->applyFields($theme, $input);
        $this->applyAuthorAndMedia($theme, $input, $this->userRepository, $this->mediaRepository);

        $this->em->persist($theme);
        $this->em->flush();

        return ['theme' => $theme, 'errorCode' => null];
    }
}
