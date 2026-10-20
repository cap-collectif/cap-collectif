<?php

namespace Capco\AppBundle\GraphQL\Mutation\Page;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreatePageMutation implements MutationInterface
{
    use MutationTrait;
    use PageInputTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MediaRepository $mediaRepository,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    /**
     * @return array{page: Page|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $translations = $input->offsetGet('translations') ?? [];
        $errorCode = $this->getTranslationsErrorCode($translations, $this->localeRepository->getDefaultCode());
        if (null !== $errorCode) {
            return ['page' => null, 'errorCode' => $errorCode];
        }

        $page = new Page();
        $this->applyTranslations($page, $translations);
        $page->setIsEnabled((bool) ($input->offsetGet('isEnabled') ?? true));
        $this->applyCoverAndCustomCode($page, $input, $this->mediaRepository);

        $this->em->persist($page);
        $this->em->flush();

        return ['page' => $page, 'errorCode' => null];
    }
}
