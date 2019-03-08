<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Admin\ReportingAdmin;
use Capco\AdminBundle\Resolver\RecentReportingResolver;
use Capco\AppBundle\Entity\Reporting;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class RecentReportingController extends Controller
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/reporting", name="admin_capco_app_reporting_index")
     * @Template("CapcoAdminBundle:RecentReporting:index.html.twig")
     */
    public function indexAction()
    {
        $resolver = $this->get(RecentReportingResolver::class);
        $reports = $resolver->getRecentReports();

        return [
            'reports' => $reports,
            'statusLabels' => Reporting::$statusesLabels,
            'recentReporting' => true,
            'base_template' => 'CapcoAdminBundle::standard_layout.html.twig',
            'admin_pool' => $this->get('sonata.admin.pool'),
            'admin' => $this->get(ReportingAdmin::class),
        ];
    }
}
