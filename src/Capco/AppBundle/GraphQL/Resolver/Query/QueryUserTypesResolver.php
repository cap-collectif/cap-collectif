<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Repository\UserTypeRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryUserTypesResolver implements QueryInterface
{
    public function __construct(private readonly UserTypeRepository $userTypeRepository)
    {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function __invoke(): array
    {
        $queryResult = $this->userTypeRepository->findAllWithMediaToArray();

        $result = [];
        foreach ($queryResult as $row) {
            $formattedRow = [
                'id' => $row['id'],
                'name' => array_shift($row['translations'])['name'],
            ];

            $formattedRow['media'] = $row['media'] ?? null;

            $result[] = $formattedRow;
        }

        return $result;
    }
}
