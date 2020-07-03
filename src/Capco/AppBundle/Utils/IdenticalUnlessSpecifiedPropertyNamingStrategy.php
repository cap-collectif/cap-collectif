<?php

namespace Capco\AppBundle\Utils;

use JMS\Serializer\Metadata\PropertyMetadata;
use JMS\Serializer\Naming\PropertyNamingStrategyInterface;

class IdenticalUnlessSpecifiedPropertyNamingStrategy implements PropertyNamingStrategyInterface
{
    public function translateName(PropertyMetadata $property): string
    {
        return $property->serializedName ?: $property->name;
    }
}
