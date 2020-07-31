<?php

namespace Capco\AppBundle\GraphQL\ExpressionLanguage;

use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction;

class HasFeatureFlag extends ExpressionFunction
{
    public function __construct()
    {
        parent::__construct('hasFeatureFlag', function (string $name) {
            return sprintf(
                '$globalVariable->get(\'container\')->get(\'%s\')->isActive(%s)',
                Manager::class,
                $name
            );
        });
    }
}
