<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Reportable;

use Capco\AppBundle\GraphQL\Resolver\Reportable\ReportableViewerCanReportResolver;
use Capco\AppBundle\Model\ReportableInterface;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;

class ReportableViewerCanReportResolverSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ReportableViewerCanReportResolver::class);
    }

    public function it_should_return_true_when_user_is_not_admin_and_user_has_not_reported_and_user_is_not_the_author(
        ReportableInterface $reportable,
        User $user
    ) {
        $user->isAdmin()->willReturn(false);
        $reportable->userDidReport($user)->willReturn(false);
        $reportable->isUserAuthor($user)->willReturn(false);

        $this->__invoke($reportable, $user)->shouldReturn(true);
    }

    public function it_should_return_false_when_user_is_admin_or_user_has_reported_or_user_is_the_author(
        ReportableInterface $reportable,
        User $user
    ) {
        $user->isAdmin()->willReturn(true);
        $reportable->userDidReport($user)->willReturn(false);
        $reportable->isUserAuthor($user)->willReturn(false);

        $this->__invoke($reportable, $user)->shouldReturn(false);

        $user->isAdmin()->willReturn(false);
        $reportable->userDidReport($user)->willReturn(true);
        $reportable->isUserAuthor($user)->willReturn(false);

        $this->__invoke($reportable, $user)->shouldReturn(false);

        $user->isAdmin()->willReturn(false);
        $reportable->userDidReport($user)->willReturn(false);
        $reportable->isUserAuthor($user)->willReturn(true);

        $this->__invoke($reportable, $user)->shouldReturn(false);
    }
}
