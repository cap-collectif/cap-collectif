<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\NewsletterSubscription;
use PhpSpec\ObjectBehavior;

class NewsletterSubscriptionSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(NewsletterSubscription::class);
    }
}
