<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reportable;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Model\ReportableInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReportableViewerCanReportResolver implements ResolverInterface
{
    use ResolverTrait;

    public function __invoke(ReportableInterface $reportable, ?User $viewer = null): bool
    {
        $viewer = $this->preventNullableViewer($viewer);
        $viewerDidReport = $reportable->userDidReport($viewer);
        $isViewerAuthor = $reportable->isUserAuthor($viewer);

        return !$viewer->isAdmin() && !$viewerDidReport && !$isViewerAuthor;
    }
}
