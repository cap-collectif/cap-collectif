<?php

namespace Capco\AppBundle\CivicIA;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\CivicIAAnalyzableInterface;
use Capco\AppBundle\Enum\CivicIASentimentEnum;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CivicIAMassUpdater
{
    final public const NOT_FOUND = 'NOT_FOUND';
    final public const INVALID_JSON = 'INVALID_JSON';

    private readonly GlobalIdResolver $globalIdResolver;
    private readonly EntityManagerInterface $entityManager;
    private readonly Indexer $indexer;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager,
        Indexer $indexer
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->entityManager = $entityManager;
        $this->indexer = $indexer;
    }

    public function __invoke(string $json, User $viewer): array
    {
        $results = [];
        foreach ($this->getDataFromJson($json) as $datum) {
            $this->checkDatumFields($datum);
            $results[] = $this->updateFromDatum($datum, $viewer);
        }

        $this->entityManager->flush();

        foreach ($results as $result) {
            $this->indexer->index(ClassUtils::getClass($result), $result->getId());
        }
        $this->indexer->finishBulk();

        return $results;
    }

    public function updateOne(
        CivicIAAnalyzableInterface $analyzable,
        ?string $category,
        ?int $readability,
        ?string $sentiment,
        ?array $categoryDetails = null,
        ?object $sentimentDetails = null
    ): CivicIAAnalyzableInterface {
        $analyzable->setIaCategory($category);
        $analyzable->setIaReadability($readability);
        $analyzable->setIaSentiment($sentiment);
        if ($categoryDetails) {
            $analyzable->setIaCategoryDetails(json_encode($categoryDetails));
        }
        if ($sentimentDetails) {
            $analyzable->setIaSentimentDetails(json_encode($sentimentDetails));
        }

        return $analyzable;
    }

    private function updateFromDatum(object $datum, User $viewer): CivicIAAnalyzableInterface
    {
        $analyzable = $this->getAnalyzable($datum->value_id, $viewer);
        $this->updateOne(
            $analyzable,
            $datum->categories,
            $datum->lisibilite,
            $datum->sentiment,
            $datum->categories_details ?? null,
            $datum->sentiment_score ?? null
        );

        return $analyzable;
    }

    private function getDataFromJson(string $json): array
    {
        $data = json_decode($json);
        if (\is_array($data)) {
            return $data;
        }

        throw new UserError(self::INVALID_JSON);
    }

    private function getAnalyzable(string $analyzableId, User $viewer): CivicIAAnalyzableInterface
    {
        $analyzable = $this->globalIdResolver->resolve($analyzableId, $viewer);
        if ($analyzable instanceof CivicIAAnalyzableInterface) {
            return $analyzable;
        }

        throw new UserError(self::NOT_FOUND);
    }

    private function checkDatumFields(object $datum): void
    {
        if (
            !isset($datum->value_id)
            || !isset($datum->categories)
            || !isset($datum->lisibilite)
            || !isset($datum->sentiment)
            || !CivicIASentimentEnum::isValid($datum->sentiment)
        ) {
            throw new UserError(self::INVALID_JSON);
        }
    }
}
