<?php

namespace Capco\AppBundle\GraphQL\Resolver\FooterSettings;

use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class FooterSettingsQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /** @return array<int, object> */
    public function __invoke(): array
    {
        $parameters = $this->repository->findBy(['category' => 'pages.footer'], ['position' => 'ASC']);
        $translations = $this->entityManager->getRepository(SiteParameterTranslation::class);

        foreach ($parameters as $parameter) {
            if (!$parameter->isTranslatable()) {
                continue;
            }
            foreach ($translations->findBy(['translatable' => $parameter]) as $translation) {
                $parameter->addTranslation($translation);
            }
        }

        return $parameters;
    }
}
