<?php

namespace Capco\AppBundle\GraphQL\Mutation\Theme;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\ThemeErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdateThemeMutation implements MutationInterface
{
    use MutationTrait;
    use ThemeInputTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ThemeRepository $themeRepository,
        private readonly UserRepository $userRepository,
        private readonly MediaRepository $mediaRepository,
        private readonly LocaleRepository $localeRepository,
        private readonly Indexer $indexer
    ) {
    }

    /**
     * @return array{theme?: Theme|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $theme = $this->themeRepository->find($input->offsetGet('id'));
        if (!$theme instanceof Theme) {
            return ['theme' => null, 'errorCode' => ThemeErrorCode::NOT_FOUND];
        }

        $translations = $input->offsetGet('translations') ?? [];
        $errorCode = $this->validateTranslations($translations, $this->localeRepository->getDefaultCode());
        if ($errorCode) {
            return ['theme' => null, 'errorCode' => $errorCode];
        }

        $this->applyTranslations($theme, $translations);
        $this->applyFields($theme, $input);
        $this->applyAuthorAndMedia($theme, $input, $this->userRepository, $this->mediaRepository);
        // Gedmo only watches a few Theme columns, while most edits change other fields or the translations.
        $theme->setUpdatedAt(new \DateTime());

        $this->em->flush();

        // Translations are not indexable, so changing only them would not trigger ElasticsearchDoctrineListener.
        $this->indexer->index(Theme::class, $theme->getId());
        $this->indexer->finishBulk();

        return ['theme' => $theme, 'errorCode' => null];
    }
}
