<?php

namespace Capco\AppBundle\GraphQL;

use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class ExtraFieldsConnection extends Connection
{
    // Keeps legacy GraphQL connection extra fields declared for PHP 8.3.
    // TODO: move these values to typed GraphQL resolvers instead of public connection fields.
    public ?int $creditsLeft = null;
    public int $creditsSpent = 0;
    public int $fusionCount = 0;
    public int $totalPointsCount = 0;
}
