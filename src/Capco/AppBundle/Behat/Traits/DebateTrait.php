<?php

namespace Capco\AppBundle\Behat\Traits;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;

trait DebateTrait
{
    /**
     * @When I go to an open debate widget
     */
    public function iGoToAnOpenDebateWidgetPage()
    {
        $this->visitPageWithParams('widget debate page', [
            'debateId' => GlobalId::toGlobalId('Debate', 'debateCannabis'),
        ]);
    }
}
