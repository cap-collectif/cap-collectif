<?php

namespace spec\Capco\AppBundle\Manager;

use PhpSpec\ObjectBehavior;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Source;

use Doctrine\Orm\EntityManager;

class ContributionManagerSpec extends ObjectBehavior
{

    function let(Notify $notifier, EntityManager $em)
    {
        $this->beConstructedWith($notifier, $em);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\ContributionManager');
    }

    function it_can_depublish_contribution_of_a_user(User $user, OpinionVote $vote, Proposal $proposal, Opinion $opinion, OpinionVersion $version, Idea $idea, Comment $comment, Argument $argument, Source $source)
    {
      $user->getVotes()->willReturn([$vote]);

      $proposal->setEnabled(false)->willReturn($proposal);
      $user->getProposals()->willReturn([$proposal]);

      $opinion->setIsEnabled(false)->willReturn($opinion);
      $user->getOpinions()->willReturn([$opinion]);

      $version->setEnabled(false)->willReturn($version);
      $user->getOpinionVersions()->willReturn([$version]);

      $idea->setIsEnabled(false)->willReturn($idea);
      $user->getIdeas()->willReturn([$idea]);

      $comment->setIsEnabled(false)->willReturn($comment);
      $user->getComments()->willReturn([$comment]);

      $argument->setIsEnabled(false)->willReturn($argument);
      $user->getArguments()->willReturn([$argument]);

      $source->setIsEnabled(false)->willReturn($source);
      $user->getSources()->willReturn([$source]);

      $this->depublishContributions($user);

      $this->notifier->sendDepublishContributionEmail(true)->shouldHaveBeenCalled();
      $this->em->remove($vote)->shouldHaveBeenCalled();
    }
}
