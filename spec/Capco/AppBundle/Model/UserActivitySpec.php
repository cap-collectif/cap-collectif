<?php

namespace spec\Capco\AppBundle\Model;

use Capco\AppBundle\Model\UserActivity;
use PhpSpec\ObjectBehavior;

class UserActivitySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(UserActivity::class);
    }

    public function it_should_return_empty_array()
    {
        $this->getUserOpinions()->shouldReturn([]);
    }

    public function it_should_add_an_opinion()
    {
        $this->addUserOpinion('opinion1', 'ALL');

        $this->getUserOpinions()->shouldReturn([
            'opinion1' => 'ALL',
        ]);

        $this->addUserOpinion('opinion2', 'ALL');

        $this->getUserOpinions()->shouldReturn([
            'opinion1' => 'ALL',
            'opinion2' => 'ALL',
        ]);
    }

    public function it_should_add_opinions()
    {
        $opinions = [
            'opinion1' => 'ALL',
            'opinion2' => 'ALL',
            'opinion3' => 'ALL',
        ];

        $this->setUserOpinions($opinions);

        $this->getUserOpinions()->shouldReturn($opinions);
    }
}
