<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Admin\ReportingAdmin;
use Capco\AdminBundle\Resolver\RecentReportingResolver;
use Capco\AppBundle\Entity\Reporting;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\Routing\Annotation\Route;

class RecentReportingController extends Controller
{
    public function __construct(private readonly BreadcrumbsBuilderInterface $breadcrumbsBuilder, private readonly Pool $pool, private readonly ReportingAdmin $admin)
    {
    }

    /**
     * @Security("is_granted('ROLE_ADMIN')")
     * @Route("/admin/reporting", name="admin_capco_app_reporting_index")
     * @Template("@CapcoAdmin/RecentReporting/index.html.twig")
     */
    public function indexAction()
    {
        $resolver = $this->get(RecentReportingResolver::class);
        $reports = $resolver->getRecentReports();

        return [
            'action' => 'list',
            'breadcrumbs_builder' => $this->breadcrumbsBuilder,
            'reports' => $reports,
            'statusLabels' => Reporting::$statusesLabels,
            'recentReporting' => true,
            'base_template' => '@CapcoAdmin/standard_layout.html.twig',
            'admin_pool' => $this->pool,
            'admin' => $this->admin,
        ];
    }
}
