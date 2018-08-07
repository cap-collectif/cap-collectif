<?php
namespace spec\Capco\AppBundle\Entity;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Entity\PostComment;
use Capco\AppBundle\Entity\Interfaces\Trashable;

class PostCommentSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(PostComment::class);
    }

    function it_is_a_publishable()
    {
        $this->shouldImplement(Publishable::class);
    }

    function it_is_a_trashable()
    {
        $this->shouldImplement(Trashable::class);
    }
}
