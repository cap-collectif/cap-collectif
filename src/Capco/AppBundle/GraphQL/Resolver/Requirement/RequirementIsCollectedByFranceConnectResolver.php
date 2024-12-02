<?php

namespace Capco\AppBundle\GraphQL\Resolver\Requirement;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Enum\FranceConnectAllowedData;
use Capco\AppBundle\GraphQL\Resolver\SSO\FranceConnectAllowedDataResolver;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class RequirementIsCollectedByFranceConnectResolver implements QueryInterface
{
    final public const MAP = [
        FranceConnectAllowedData::GIVEN_NAME => Requirement::FIRSTNAME,
        FranceConnectAllowedData::FAMILY_NAME => Requirement::LASTNAME,
        FranceConnectAllowedData::BIRTHDATE => Requirement::DATE_OF_BIRTH,
    ];

    public function __construct(private readonly Manager $manager, private readonly FranceConnectAllowedDataResolver $franceConnectAllowedDataResolver)
    {
    }

    public function __invoke(Requirement $requirement): bool
    {
        if (!$this->manager->isActive(Manager::login_franceconnect)) {
            return false;
        }

        $requirementType = $requirement->getType();

        if (!\in_array($requirementType, array_values(self::MAP))) {
            return false;
        }

        $collectedData = $this->franceConnectAllowedDataResolver->__invoke();

        $collectedDataFormatted = [];
        foreach ($collectedData as $data) {
            if (self::MAP[$data] ?? null) {
                $collectedDataFormatted[] = self::MAP[$data];
            }
        }

        return \in_array($requirementType, $collectedDataFormatted);
    }
}
