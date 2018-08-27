<?php
namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument as Arg;
use Doctrine\Orm\EntityManager;
use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\OpinionVersion;

class ContributionManagerSpec extends ObjectBehavior
{
    function it_is_initializable(Indexer $indexer)
    {
        $this->beConstructedWith($indexer);
        $this->shouldHaveType('Capco\AppBundle\Manager\ContributionManager');
    }

    function it_can_publish_contributions_of_a_user(
        Indexer $indexer,
        User $user,
        OpinionVote $vote,
        Proposal $proposal,
        Opinion $opinion,
        OpinionVersion $version,
        Comment $comment,
        Argument $argument,
        Source $source,
        Reply $reply
    ) {
        $this->beConstructedWith($indexer);

        $proposal->getStep()->willReturn(null);
        $proposal->getId()->willReturn('proposal1');
        $proposal->setPublishedAt(Arg::any())->shouldBeCalled();
        $opinion->getStep()->willReturn(null);
        $opinion->getId()->willReturn('opinion1');
        $opinion->setPublishedAt(Arg::any())->shouldBeCalled();
        $version->getStep()->willReturn(null);
        $version->getId()->willReturn('version1');
        $version->setPublishedAt(Arg::any())->shouldBeCalled();
        $comment->getStep()->willReturn(null);
        $comment->getId()->willReturn('opinion1');
        $comment->setPublishedAt(Arg::any())->shouldBeCalled();
        $argument->getStep()->willReturn(null);
        $argument->getId()->willReturn('argument1');
        $argument->setPublishedAt(Arg::any())->shouldBeCalled();
        $source->getStep()->willReturn(null);
        $source->getId()->willReturn('source1');
        $source->setPublishedAt(Arg::any())->shouldBeCalled();
        $reply->getStep()->willReturn(null);
        $reply->getId()->willReturn('reply1');
        $reply->setPublishedAt(Arg::any())->shouldBeCalled();

        $user
            ->getContributions()
            ->willReturn([
                $vote,
                $proposal,
                $opinion,
                $version,
                $comment,
                $argument,
                $source,
                $reply,
            ]);

        $this->publishContributions($user)->shouldReturn(true);
    }

    function it_can_publish_contribution_of_a_user_with_nothing(Indexer $indexer, User $user)
    {
        $this->beConstructedWith($indexer);
        $user->getContributions()->willReturn([]);
        $this->publishContributions($user)->shouldReturn(false);
    }
}
