<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reporting;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * Back office edit page of the reported contribution, as linked by the former Sonata reporting page
 * (Reporting/object_show_field.html.twig). Null for a contribution without one (e.g. a debate argument).
 */
class ReportingRelatedAdminUrlResolver implements QueryInterface
{
    private const EDIT_ROUTE_BY_CLASS = [
        Opinion::class => 'admin_capco_app_opinion_edit',
        OpinionVersion::class => 'admin_capco_app_opinionversion_edit',
        Source::class => 'admin_capco_app_source_edit',
        Argument::class => 'admin_capco_app_argument_edit',
        // Any comment (proposal, event, post...) links to its own edit page, not to the commented object
        Comment::class => 'admin_capco_app_comment_edit',
        Proposal::class => 'admin_capco_app_proposal_edit',
    ];

    public function __construct(
        private readonly RouterInterface $router
    ) {}

    public function __invoke(Reporting $reporting): ?string
    {
        $related = $reporting->getRelatedObject();
        if (null === $related) {
            return null;
        }

        foreach (self::EDIT_ROUTE_BY_CLASS as $class => $route) {
            if ($related instanceof $class) {
                return $this->router->generate(
                    $route,
                    ['id' => $related->getId()],
                    RouterInterface::ABSOLUTE_URL
                );
            }
        }

        return null;
    }
}
