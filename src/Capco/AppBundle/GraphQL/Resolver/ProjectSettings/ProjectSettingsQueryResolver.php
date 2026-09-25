<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProjectSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Entity\SiteParameterTranslation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProjectSettingsQueryResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteParameterRepository $repository,
        private readonly EntityManagerInterface $entityManager
    ) {
    }

    /**
     * @return SiteParameter[]
     */
    public function __invoke(): array
    {
        /** @var SiteParameter[] $parameters */
        $parameters = $this->repository->findBy(['category' => 'pages.projects'], ['position' => 'ASC']);
        $translationRepository = $this->entityManager->getRepository(SiteParameterTranslation::class);

        foreach ($parameters as $parameter) {
            if (!$parameter->isTranslatable()) {
                continue;
            }

            foreach ($translationRepository->findBy(['translatable' => $parameter]) as $translation) {
                $parameter->addTranslation($translation);
            }
        }

        return $parameters;
    }
}
