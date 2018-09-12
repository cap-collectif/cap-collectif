<?php
namespace spec\Capco\AppBundle\Model;

use PhpSpec\ObjectBehavior;

class UserActivitySpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Model\UserActivity');
    }

    function it_should_return_empty_array()
    {
        $this->getUserOpinions()->shouldReturn([]);
    }

    function it_should_add_an_opinion()
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

    function it_should_add_opinions()
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
