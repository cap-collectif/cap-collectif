<?php
namespace Capco\AppBundle\Twig;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class GlobalIdExtension extends \Twig_Extension
{
    public function getName()
    {
        return 'globalId';
    }

    public function getFilters()
    {
        return [
            'toGlobalId' => new \Twig_Filter_Method($this, 'toGlobalId'),
        ];
    }

    public function toGlobalId(string $id, string $type): string
    {
        return GlobalId::toGlobalId($type, $id);
    }
}
